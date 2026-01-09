import mongoose, { Schema, model, models } from 'mongoose';

export interface IAgent extends mongoose.Document {
  name: string;
  bolnaAgentId: string;
  description?: string;
  color?: string;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an agent name'],
    },
    bolnaAgentId: {
      type: String,
      required: [true, 'Please provide a Bolna agent ID'],
    },
    description: {
      type: String,
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Agent = models.Agent || model<IAgent>('Agent', AgentSchema);

export default Agent;
