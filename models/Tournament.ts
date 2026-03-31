import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITournament extends Document {
  name: string;
  totalTeams: number;
  totalMatches: number;
  killPoints: number;
  winnerPoints: number;
  lastRankPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true },
    totalTeams: { type: Number, required: true, min: 2 },
    totalMatches: { type: Number, required: true, min: 1 },
    killPoints: { type: Number, required: true, default: 1 },
    winnerPoints: { type: Number, required: true, default: 15 },
    lastRankPoints: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

TournamentSchema.index({ name: 1 });

const Tournament: Model<ITournament> =
  mongoose.models.Tournament ||
  mongoose.model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
