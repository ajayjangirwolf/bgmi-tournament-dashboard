import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IScore extends Document {
  teamId: Types.ObjectId;
  matchId: Types.ObjectId;
  tournamentId: Types.ObjectId;
  kills: number;
  placement: number;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    kills: { type: Number, default: 0, min: 0 },
    placement: { type: Number, default: 0, min: 0 },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ScoreSchema.index({ teamId: 1, matchId: 1 }, { unique: true });
ScoreSchema.index({ tournamentId: 1 });

const Score: Model<IScore> =
  mongoose.models.Score || mongoose.model<IScore>("Score", ScoreSchema);

export default Score;
