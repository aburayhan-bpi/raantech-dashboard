import mongoose, { Schema, Document } from 'mongoose';

export interface IExchangeHistory {
  exchangeDate: Date;
  reason: string;
  previousSerialNumber?: string;
  newSerialNumber?: string;
}

export interface ISale extends Document {
  product: mongoose.Types.ObjectId;
  serialNumber?: string;
  salePrice: number;
  saleDate: Date;
  customerName: string;
  customerPhone: string;
  soldBy: mongoose.Types.ObjectId;
  status: 'SOLD' | 'EXCHANGED' | 'REFUNDED';
  exchangeHistory: IExchangeHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeHistorySchema = new Schema<IExchangeHistory>({
  exchangeDate: { type: Date, required: true },
  reason: { type: String, required: true },
  previousSerialNumber: { type: String },
  newSerialNumber: { type: String },
});

const SaleSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    serialNumber: { type: String },
    salePrice: { type: Number, required: true },
    saleDate: { type: Date, required: true, default: Date.now },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    soldBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['SOLD', 'EXCHANGED', 'REFUNDED'],
      default: 'SOLD',
    },
    exchangeHistory: { type: [ExchangeHistorySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
