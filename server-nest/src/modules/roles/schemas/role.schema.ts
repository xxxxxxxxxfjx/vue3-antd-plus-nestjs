import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true, versionKey: false })
export class Role {
  @Prop({ required: true, unique: true, index: true })
  roleName: string;

  @Prop({ required: true })
  roleAuth: string;

  @Prop({ type: [String], default: [] })
  perms: string[];

  @Prop()
  remark: string;

  @Prop({ required: true, default: true })
  status: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
