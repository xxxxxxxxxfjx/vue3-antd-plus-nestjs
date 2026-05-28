import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsersOptLogDocument = UsersOptLog & Document;

@Schema({ timestamps: true, versionKey: false, collection: 'users_opt_logs' })
export class UsersOptLog {
  @Prop()
  operator: string;

  @Prop()
  operatorId: string;

  @Prop()
  module: string;

  @Prop()
  platform: string;

  @Prop()
  operatorIP: string;

  @Prop()
  address: string;

  @Prop()
  content: string;
}

export const UsersOptLogSchema = SchemaFactory.createForClass(UsersOptLog);
