import Papa from 'papaparse';

import { MEMBER_NAMES } from './constants';
import { HomeworkRow, MemberData } from './types';

async function init(): Promise<void> {
    const homeworkFile = await fetch('homework_history.csv').then(r => r.text());
    const homeworkHistory = Papa.parse<HomeworkRow>(homeworkFile, {
        header: true
    }).data;
    const members = calculateMemberData(homeworkHistory);

    let probabilityAcc = 0;
    members.forEach(member => {
        const homeworkOptions = document.getElementById('homework-options');
        if (homeworkOptions) {
            homeworkOptions.innerHTML += `
                <div>
                    <div class="member-info" id="${member.name}">
                        <div class="member-name">${member.name}</div>
                        <div>Probability: ${(member.probability * 100).toFixed(2)}%</div>
                        <div>Range: ${probabilityAcc.toFixed(2)}-${(probabilityAcc + member.probability * 100).toFixed(2)}</div>
                    </div>

                    <div class="homework-inputs">
                        <label id="${member.name}-homework" for="${member.name}-homework">Homework Idea:</label>
                        <input name="${member.name}-homework" type="text">
                    </div>
                </div>
            `;
        }
        probabilityAcc += member.probability * 100;
    });

    const homeworkForm = document.getElementById('homework-form');
    homeworkForm?.addEventListener('submit', event => {
        event.preventDefault();
        decideHomework(members);
    });
}

init();

function calculateMemberData(homeworkHistory: HomeworkRow[]): MemberData[] {
    const members = MEMBER_NAMES.map(memberName => {
        const chosenCount = homeworkHistory.reduce(
            (acc, homework) => homework.suggester === memberName ? acc + 1 : acc, 0
        );
        return {
            name: memberName,
            chosenCount,
            // If a member has never been chosen, their inverseChosenCount would equal infinity
            // Instead, arbitrarily inflate their probability with a finite number (10)
            inverseChosenCount: chosenCount === 0 ? 10 : 1 / chosenCount,
            probability: 0
        }
    });

    const totalInverseChosenCount = members.reduce(
        (acc, member) => acc + member.inverseChosenCount, 0
    );

    members.forEach(member => {
        member.probability = member.inverseChosenCount / totalInverseChosenCount
    });

    return members;
}

function decideHomework(members: MemberData[]): void {
    const chosenMember = chooseMember(members);
    updateUI(chosenMember);
}

function chooseMember(members: MemberData[]): MemberData {
    let random = Math.random();

    const randomNumberLabel = document.getElementById(`random-number`);
    if (randomNumberLabel) randomNumberLabel.innerHTML = random.toString();

    for (let i = 0; i < members.length; i++) {
        if (random < members[i].probability) {
            return members[i];
        }
        random -= members[i].probability;
    }

    throw new Error('Failed to choose a member.');
}

function updateUI(chosenMember: MemberData): void {
    const memberNameLabel = document.getElementById(`${chosenMember.name}`);
    if (memberNameLabel) memberNameLabel.style.color = 'red';

    const homeworkLabel = document.getElementById(`${chosenMember.name}-homework`);
    if (homeworkLabel) homeworkLabel.style.color = 'red';

    const submitButton = document.getElementById('submit-button');
    if (submitButton) submitButton.style.display = 'none';
}