// This file was generated from Ætérnalbot type definitions. DO NOT EDIT!
export type Bool = { value: boolean };

export type CreateMeetingRequestBody = { date: string };

export type I32 = { value: number };

export type MeetingParticipant = { member: Snowflake; absentee_voter: boolean };

/**
 * UŊ Meeting.
 */
export type Meeting = { id: number; date: string };

/**
 * UŊ Member.
 */
export type MemberProfile = {
  discord_id: Snowflake;
  display_name: string;
  avatar_url: string;
  administrator: boolean;
};

export type MotionNoText = {
  id: number;
  author: Snowflake;
  type: string;
  title: string;
  meeting: number;
  quorum: number;
  locked: boolean;
  closed: boolean;
  supported: boolean;
  passed: boolean;
  enabled: boolean;
};

export type Motion = {
  text: string;
  id: number;
  author: Snowflake;
  type: string;
  title: string;
  meeting: number;
  quorum: number;
  locked: boolean;
  closed: boolean;
  supported: boolean;
  passed: boolean;
  enabled: boolean;
};

export type Nation = {
  id: number;
  name: string;
  flag_url: string | null;
  active: boolean;
};

export type SetMotionMeetingRequestBody = { motion: number; meeting: number };

/**
 * JavaScript is too stupid for proper 64-bit integers, so do this jank instead.
 */
export type Snowflake = string;

export type Vote = { member: MemberProfile; vote: boolean };
