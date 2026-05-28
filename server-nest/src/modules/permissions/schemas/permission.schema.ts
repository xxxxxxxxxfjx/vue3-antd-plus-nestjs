import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true, versionKey: false })
export class Permission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  key: string;

  @Prop()
  parent_key: string;

  @Prop({ default: false })
  auth: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ required: true, default: false })
  disabled: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.statics.toTree = function (permissions: any[]) {
  const tree: any[] = [];
  const map: any = {};

  permissions.forEach((permission) => {
    map[permission.key] = { ...permission };
  });

  permissions.forEach((permission) => {
    const parent = map[permission.parent_key];
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(map[permission.key]);
    } else {
      tree.push(map[permission.key]);
    }
  });

  return tree;
};
