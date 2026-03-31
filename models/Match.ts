import mongoose, { Schema, Document, Model, Types } from "mongoose";

const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi"] as const;
export type MapName = (typeof MAPS)[number];

export interface IMatch extends Document {
  tournamentId: Types.ObjectId;
  matchNumber: number;
  matchName?: string;
  mapName: MapName;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    matchNumber: { type: Number, required: true },
    matchName: { type: String, trim: true },
    mapName: { type: String, enum: MAPS, required: true },
  },
  { timestamps: true }
);

MatchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;
