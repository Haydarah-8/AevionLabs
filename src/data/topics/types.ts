export type TopicKind = "company" | "technology" | "service";

export type TopicExample = {
  title: string;
  body: string;
};

export type TopicPoint = {
  title: string;
  body: string;
};

export type TopicFaq = {
  question: string;
  answer: string;
};

export type KnownUser = {
  name: string;
  note: string;
};

export type TopicDetail = {
  introHeading: string;
  problem: string;
  aside: string;
  note: string;
  what: string[];
  usedFor: string[];
  knownUsers: KnownUser[];
  willDo: string[];
  fit: TopicPoint[];
  process: TopicPoint[];
  deliverables: string[];
  refuse: string[];
  faqs: TopicFaq[];
  cases: TopicExample[];
};

export type TopicDetailSeed = {
  group?: string;
  introHeading: string;
  problem: string;
  aside: string;
  note: string;
  fit: TopicPoint[];
  faqs: TopicFaq[];
  extraCases?: TopicExample[];
};

export type Topic = {
  slug: string;
  name: string;
  kind: TopicKind;
  color?: string;
  kicker: string;
  headline: string;
  lede: string;
  about: string;
  how: string;
  uses: string[];
  examples: TopicExample[];
  related: string[];
  officialUrl?: string;
};
