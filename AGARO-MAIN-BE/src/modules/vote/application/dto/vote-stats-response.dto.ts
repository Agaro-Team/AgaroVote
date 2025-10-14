import { VoteStat } from '@modules/vote/domain/entities/vote-stat.entity';

export class VoteStatsResponseDto {
  id: string;
  pollId: string;
  choiceId: string;
  voteCount: number;
  votePercentage: number;
  lastVoteAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(stat: VoteStat): VoteStatsResponseDto {
    const dto = new VoteStatsResponseDto();
    dto.id = stat.id;
    dto.pollId = stat.pollId;
    dto.choiceId = stat.choiceId;
    dto.voteCount = stat.voteCount;
    dto.votePercentage = Number(stat.votePercentage);
    dto.lastVoteAt = stat.lastVoteAt;
    dto.createdAt = stat.createdAt;
    dto.updatedAt = stat.updatedAt;
    return dto;
  }

  static fromEntities(stats: VoteStat[]): VoteStatsResponseDto[] {
    return stats.map((stat) => this.fromEntity(stat));
  }
}

export class PollVoteStatsResponseDto {
  pollId: string;
  totalVotes: number;
  choices: ChoiceStatsDto[];
  lastUpdatedAt?: Date;

  static create(pollId: string, stats: VoteStat[]): PollVoteStatsResponseDto {
    const dto = new PollVoteStatsResponseDto();
    dto.pollId = pollId;
    dto.totalVotes = stats.reduce((sum, stat) => sum + stat.voteCount, 0);
    dto.choices = stats.map((stat) => ({
      choiceId: stat.choiceId,
      voteCount: stat.voteCount,
      votePercentage: Number(stat.votePercentage),
    }));

    const latestVote = stats
      .filter((s) => s.lastVoteAt)
      .sort((a, b) => b.lastVoteAt!.getTime() - a.lastVoteAt!.getTime())[0];

    dto.lastUpdatedAt = latestVote?.lastVoteAt;

    return dto;
  }
}

export interface ChoiceStatsDto {
  choiceId: string;
  voteCount: number;
  votePercentage: number;
}
