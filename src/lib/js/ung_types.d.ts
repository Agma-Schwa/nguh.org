// This file was generated from Ætérnalbot type definitions. DO NOT EDIT!
export type BooleanProperty = { value: boolean };

export type LockPageRequestBody = { id: number; locked: boolean };

/**
 * UŊ Member.
 */
export type MemberProfile = {
  discord_id: Snowflake;
  display_name: string;
  avatar_url: string;
  administrator: boolean;
};

export type MotionId = { id: number };

export type MotionNoText = {
  id: number;
  author: Snowflake;
  type: string;
  title: string;
  locked: boolean;
  closed: boolean;
};

export type Motion = {
  text: string;
  id: number;
  author: Snowflake;
  type: string;
  title: string;
  locked: boolean;
  closed: boolean;
};

/**
 * JavaScript is too stupid for proper 64-bit integers, so do this jank instead.
 */
export type Snowflake = string;
