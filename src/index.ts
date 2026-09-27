import Chart from 'chart.js/auto';
import Papa from 'papaparse';

import { MEMBERS } from './constants';
import { HomeworkRow, MemberData } from './types';

async function init(): Promise<void> {
    const homeworkHistory = await loadHomeworkHistory();
    const members = calculateMemberData(homeworkHistory);

    initLegend(members);
    initWheel(members);
    initSpinButton(members);
}

init();

async function loadHomeworkHistory(): Promise<HomeworkRow[]> {
    const homeworkFile = await fetch('homework_history.csv').then(r => r.text());
    return Papa.parse<HomeworkRow>(homeworkFile, {
        header: true
    }).data;
}

function calculateMemberData(homeworkHistory: HomeworkRow[]): MemberData[] {
    const members = MEMBERS.map(member => {
        const chosenCount = homeworkHistory.reduce(
            (acc, homework) => homework.suggester === member.name ? acc + 1 : acc, 0
        );
        return {
            ...member,
            chosenCount,
            // If a member has never been chosen, their inverseChosenCount would equal infinity
            // Instead, arbitrarily inflate their probability with a finite number (0.25)
            inverseChosenCount: chosenCount === 0 ? 0.25 : 1 / chosenCount,
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

function initLegend(members: MemberData[]): void {
    let probabilityAcc = 0;
    members.forEach(member => {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML += `
                <div class="member-info" id="${member.name}">
                    <div class="member-name" style="color: ${member.color}">${member.name}</div>
                    <div>Probability: ${(member.probability * 100).toFixed(2)}%</div>
                    <div>Range: ${probabilityAcc.toFixed(2)} - ${(probabilityAcc + member.probability * 100).toFixed(2)}</div>
                </div>
            `;
        }
        probabilityAcc += member.probability * 100;
    });
}

function initWheel(members: MemberData[]): void {
    new Chart(
        document.getElementById('wheel') as HTMLCanvasElement,
        {
            type: 'pie',
            data: {
                datasets: [{
                    data: members.map(member => member.probability),
                    backgroundColor: members.map(member => member.color)
                }],
            },
            options: {
                responsive: false,
                events: [],
                animation: {
                    animateRotate: false
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            },
        }
    );

    const pointer = document.getElementById('pointer') as HTMLCanvasElement;
    const ctx = pointer.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(25, 50);
        ctx.lineTo(50, 0);
        ctx.fillStyle = '#FFF';
        ctx.fill();
    }
}

function initSpinButton(members: MemberData[]): void {
    const spinButton = document.getElementById('spin-button');
    spinButton?.addEventListener('click', () => {
        decideHomework(members);
    });
}

function decideHomework(members: MemberData[]): void {
    let randomNumber = Math.random();

    resetUI();
    spinWheel(randomNumber);
    const chosenMember = chooseMember(members, randomNumber);
    setTimeout(() => updateUI(chosenMember, randomNumber), 10000);
}

function resetUI(): void {
    const memberInfos = document.querySelectorAll<HTMLElement>('.member-info');
    memberInfos.forEach(memberInfo => {
        memberInfo.style.border = '1px solid transparent';
    });

    const randomNumberLabel = document.getElementById(`random-number`);
    if (randomNumberLabel) randomNumberLabel.innerHTML = "";
}

function spinWheel(randomNumber: number): void {
    function getRandomIntInclusive(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

    const wheel = document.getElementById('wheel');
    wheel!.animate(
        [
            { transform: 'rotate(0deg)' },
            { transform: `rotate(${(360 * getRandomIntInclusive(5, 10)) - (360 * randomNumber)}deg)` }
        ],
        {
            duration: 10000,
            easing: 'ease',
            fill: 'forwards'
        }
    );
}

function chooseMember(members: MemberData[], randomNumber: number): MemberData {
    for (let i = 0; i < members.length; i++) {
        if (randomNumber < members[i].probability) {
            return members[i];
        }
        randomNumber -= members[i].probability;
    }
    return members[0];
}

function updateUI(chosenMember: MemberData, randomNumber: number): void {
    const memberInfo = document.getElementById(`${chosenMember.name}`);
    if (memberInfo) memberInfo.style.border = '1px solid white';

    const randomNumberLabel = document.getElementById(`random-number`);
    if (randomNumberLabel) randomNumberLabel.innerHTML = `Generated Number: ${randomNumber.toFixed(2)}`;
}