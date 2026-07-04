"use strict";
const MEMBER_NAMES = [
    'Alex',
    'Jordyn',
    'Kam',
    'Leo'
];
;
const HOMEWORK_HISTORY = [
    {
        date: new Date('05-16-2026'),
        giver: 'Leo',
        idea: 'Play a few games of Dota 2'
    },
    {
        date: new Date('05-16-2026'),
        giver: 'Alex',
        idea: 'Listen to "Bridge Over Troubled Water" by Simon & Garfunkel'
    },
    {
        date: new Date('05-30-2026'),
        giver: 'Alex',
        idea: 'Make an art piece'
    },
    {
        date: new Date('06-06-2026'),
        giver: 'Alex',
        idea: 'Write a genuine, heartfelt poem'
    },
    {
        date: new Date('06-13-2026'),
        giver: 'Kam',
        idea: 'Eat a meal outside and listen to nature'
    },
    {
        date: new Date('06-20-2026'),
        giver: 'Leo',
        idea: 'Listen to an album you liked in middle school'
    },
    {
        date: new Date('06-27-2026'),
        giver: 'Leo',
        idea: 'Work on a personal programming project'
    }
];
function calculateMemberData() {
    const members = MEMBER_NAMES.map(memberName => {
        const chosenCount = HOMEWORK_HISTORY.reduce((acc, homework) => homework.giver === memberName ? acc + 1 : acc, 0);
        return {
            name: memberName,
            chosenCount,
            inverseChosenCount: chosenCount === 0 ? 5 : 1 / chosenCount,
            probability: 0
        };
    });
    const totalInverseChosenCount = members.reduce((acc, member) => acc + member.inverseChosenCount, 0);
    members.forEach(member => {
        member.probability = member.inverseChosenCount / totalInverseChosenCount;
    });
    return members;
}
function chooseMember(members) {
    let random = Math.random();
    for (let i = 0; i < members.length; i++) {
        if (random < members[i].probability) {
            return members[i];
        }
        random -= members[i].probability;
    }
    throw new Error('Failed to choose a member.');
}
function decideHomework() {
    const members = calculateMemberData();
    const chosenMember = chooseMember(members);
    const memberName = document.getElementById(`${chosenMember.name}`);
    if (memberName)
        memberName.style.color = 'red';
    const chosenHomework = Math.floor(Math.random() * 2) + 1;
    const homeworkLabel = document.getElementById(`${chosenMember.name}-homework-${chosenHomework}`);
    if (homeworkLabel)
        homeworkLabel.style.color = 'red';
    const submitButton = document.getElementById('submit-button');
    if (submitButton)
        submitButton.style.display = 'none';
}
function initUI() {
    MEMBER_NAMES.forEach(memberName => {
        const homeworkOptions = document.getElementById('homework-options');
        if (homeworkOptions) {
            homeworkOptions.innerHTML += `
                <div>
                    <div id="${memberName}">${memberName}</div>
                    <label id="${memberName}-homework-1" for="${memberName}-homework-1">Homework Idea 1:</label>
                    <input name="${memberName}-homework-1" type="text">
                    <label id="${memberName}-homework-2" for="${memberName}-homework-2">Homework Idea 2:</label>
                    <input name="${memberName}-homework-2" type="text">
                </div>
            `;
        }
    });
    const homeworkForm = document.getElementById('homework-form');
    homeworkForm?.addEventListener('submit', event => {
        event.preventDefault();
        decideHomework();
    });
}
initUI();
