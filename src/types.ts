import { MEMBER_NAMES } from './constants';

export type MemberName = typeof MEMBER_NAMES[number];

export interface HomeworkRow {
    date: string;
    suggester: MemberName;
    idea: string;
}

export interface MemberData {
    name: MemberName;
    chosenCount: number;
    inverseChosenCount: number;
    probability: number;
}