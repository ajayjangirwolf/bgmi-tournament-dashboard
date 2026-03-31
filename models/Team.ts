import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITeam extends Document {
  name: string;
  logo?: string;
  tournamentId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

TeamSchema.index({ tournamentId: 1, name: 1 });

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
