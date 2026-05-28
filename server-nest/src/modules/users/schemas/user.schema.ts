import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop()
  avatar: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;

  @Prop()
  remark: string;

  @Prop({ required: true, default: true })
  status: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
