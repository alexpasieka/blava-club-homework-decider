// import fs from 'fs';
import Papa from 'papaparse';

import { MEMBER_NAMES } from './constants';
import { HomeworkRow, MemberData } from './types';

async function init(): Promise<void> {
    // TODO
    // const homeworkFile = fs.readFileSync('homework_history.csv', 'utf-8');
    const homeworkFile = await fetch('homework_history.csv').then(r => r.text());
    const homeworkHistory = Papa.parse<HomeworkRow>(homeworkFile, {
        header: true
    }).data;
    const members = calculateMemberData(homeworkHistory);

    members.forEach(member => {
        const homeworkOptions = document.getElementById('homework-options');
        if (homeworkOptions) {
            homeworkOptions.innerHTML += `
                <div>
                    <div class="member-label" id="${member.name}">
                        <span class="member-name">${member.name}</span>
                        <span>(${(member.probability * 100).toFixed(2)}%)</span>
                    </div>

                    <div class="homework-inputs">
                        <label id="${member.name}-homework-1" for="${member.name}-homework-1">Homework Idea 1:</label>
                        <input name="${member.name}-homework-1" type="text">
                        <label id="${member.name}-homework-2" for="${member.name}-homework-2">Homework Idea 2:</label>
                        <input name="${member.name}-homework-2" type="text">
                    </div>
                </div>
            `;
        }
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
            // Instead, arbitrarily inflate their probability with a finite number (5)
            inverseChosenCount: chosenCount === 0 ? 5 : 1 / chosenCount,
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
    const chosenHomework = Math.floor(Math.random() * 2) + 1;
    updateUI(chosenMember, chosenHomework);
    // updateHistory();
}

function chooseMember(members: MemberData[]): MemberData {
    let random = Math.random();

    for (let i = 0; i < members.length; i++) {
        if (random < members[i].probability) {
            return members[i];
        }
        random -= members[i].probability;
    }

    throw new Error('Failed to choose a member.');
}

function updateUI(chosenMember: MemberData, chosenHomework: number): void {
    const memberNameLabel = document.getElementById(`${chosenMember.name}`);
    if (memberNameLabel) memberNameLabel.style.color = 'red';

    const homeworkLabel = document.getElementById(`${chosenMember.name}-homework-${chosenHomework}`);
    if (homeworkLabel) homeworkLabel.style.color = 'red';

    const submitButton = document.getElementById('submit-button');
    if (submitButton) submitButton.style.display = 'none';
}

// function updateHistory(): void {
//     fs.appendFileSync('homework_history.csv', '\n123,Alex,Yay');
// }