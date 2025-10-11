type Choice = {
  choiceText: string;
};

type Address = {
  walletAddress: string;
};

type CreatePollRequest = {
  title: string;
  description: string;
  choices: Choice[];
  startDate: Date;
  endDate: Date;
  isPrivate: boolean;
  poolHash: string;
  addresses?: Address[];
  creatorWalletAddress: string;
};
