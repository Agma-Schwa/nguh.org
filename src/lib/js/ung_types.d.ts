// This file was generated from Ætérnalbot type definitions. DO NOT EDIT!
export type AdmissionFormRequestBody = {
  name: string;
  ruler: string;
  banner_text: string;
  banner_url: string;
  claim_text: string;
  claim_url: string;
  trivia: string;
};

export type Admission = {
  id: number;
  author: MemberProfile;
  passed: boolean;
  closed: boolean;
  name: string;
  ruler: string;
  banner_text: string;
  banner_url: string;
  claim_text: string;
  claim_url: string;
  trivia: string;
};

/**
 * A boolean value.
 */
export type Bool = { value: boolean };

export type CreateMeetingRequestBody = { date: string };

export type CreateMotion = { type: MotionType; title: string; text: string };

/**
 * An integer value.
 */
export type I32 = { value: number };

/**
 * An entry for a participant in a UŊ meeting.
 */
export type MeetingParticipant = { nation: Nation; absentee_voter: boolean };

/**
 * UŊ Meeting.
 */
export type Meeting = { id: number; name: string };

/**
 * UŊ Member.
 */
export type MemberProfile = {
  discord_id: Snowflake;
  display_name: string;
  avatar_url: string;
  represented_nation: number | null;
  active: boolean;
  administrator: boolean;
  staff_only: boolean;
};

/**
 * A motion but without the text; this is usually used for APIs that
 * return motions in bulk to avoid transferring too much data.
 */
export type MotionNoText = {
  id: number;
  author: Snowflake;
  type: MotionType;
  title: string;
  meeting: number;
  quorum: number;
  locked: boolean;
  closed: boolean;
  supported: boolean;
  passed: boolean;
  enabled: boolean;
};

/**
 * UŊ Motion.
 */
export type Motion = {
  text: string;
  id: number;
  author: Snowflake;
  type: MotionType;
  title: string;
  meeting: number;
  quorum: number;
  locked: boolean;
  closed: boolean;
  supported: boolean;
  passed: boolean;
  enabled: boolean;
};

/**
 * The type of a motion.
 */
export type MotionType =
  | "Unsure"
  | "Legislative"
  | "Executive"
  | "Constitutional";

/**
 * UŊ Member that represents a ŋation.
 */
export type NationMemberProfile = {
  /**
   * Whether this member is a ruler of this ŋation, allowing them to add/remove members.
   */
  ruler: boolean;
  discord_id: Snowflake;
  display_name: string;
  avatar_url: string;
  represented_nation: number | null;
  active: boolean;
  administrator: boolean;
  staff_only: boolean;
};

/**
 * UŊ Ŋation.
 */
export type Nation = {
  id: number;
  name: string;
  banner_url: string | null;
  active: boolean;
};

export type SetMotionMeetingRequestBody = { motion: number; meeting: number };

/**
 * JavaScript is too stupid for proper 64-bit integers, so do this jank instead.
 *
 * Since Ids for our own custom objects are unlikely to ever exceed 2 *billion*,
 * we just use i32s for them, which *can* be represented as JS numbers. Snowflakes
 * are only used for Ids coming from Discord, which currently is just member Ids.
 */
export type Snowflake = string;

/**
 * A vote on a motion.
 */
export type Vote = {
  /**
   * The member that voted on behalf of the ŋation.
   */
  member: MemberProfile;
  /**
   * The nation that cast the vote.
   */
  nation: Nation;
  /**
   * True if the vote was in favour and false otherwise.
   */
  vote: boolean;
};
