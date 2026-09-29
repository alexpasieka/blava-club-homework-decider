export interface HomeworkRow {
    date: string;
    suggester: string;
    idea: string;
}

export interface MemberData {
    name: string;
    color: string;
    chosenCount: number;
    participationCount: number;
    inverseChosenCount: number;
    probability: number;
}