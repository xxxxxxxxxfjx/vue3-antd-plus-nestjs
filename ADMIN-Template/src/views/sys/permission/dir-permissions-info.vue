<template>
  <section>
    <ZySearchForm
        :formValue="state.query.params"
        @submit="goPage"
        @reset="handleReset"
    >
      <a-form-item name="name">
        <a-input v-model:value="state.query.params.name" allowClear placeholder="请输入权限名称" @pressEnter="goPage"
                 autocomplete="off"/>
      </a-form-item>
    </ZySearchForm>
    <ZyFittleRow @add="goEdit"
                 addAuth="syspermissions:create"
                 :showDelete="false"/>
    <a-table
        bordered
        :resizable="true"
        :loading="state.loading"
        :columns="columns"
        :row-key="record => record._id"
        :pagination="state.query.pagination"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        :data-source="state.dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-switch v-model:checked="record.status" :disabled="!hasPerms('sys:permissions:stop')"
                    checked-children="正常"
                    un-checked-children="停用"
                    @change="statusChange(record)"/>
        </template>
        <template v-if="column.key === 'auth'">
          <a-tag color="#87d068" v-if="record.auth">是</a-tag>
        </template>
        <template v-if="column.key === 'key'">
          <a-tag color="green" v-copy="record.key">{{ record.key }}</a-tag>
        </template>
        <template v-if="column.key === 'parent_key'">
          <a-tag color="green" v-if="record.parent_key" v-copy="record.key">{{ record.parent_key }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <ZyToolButton
              viewAuth="sys:permissions:list"
              editAuth="sys:permissions:update"
              deleteAuth="sys:permissions:delete"
              @view="goView(record)"
              :showEdit="record.status"
              @edit="goEdit(record)"
              @delete="goDelete(record)"
          >
          </ZyToolButton>
        </template>
      </template>
    </a-table>
    <ZyModal :minWidth="650" :show="state.show.edit" :title="state.editTitle" :key="state.editTitle"
             @close="close">
      <GetPermissionsInfo :updateData="state.updateData" @close="close"/>
    </ZyModal>
    <ZyModal :minWidth="650" :show="state.show.view" title="查看权限" key="ViewPermissionsInfo" @close="close">
      <ViewPermissionsInfo :viewData="state.viewData" @close="close"/>
    </ZyModal>
  </section>

</template>

<script setup>
/***权限管理管理 生成：2023/7/6 下午4:02:21***/

import {reactive, toRaw} from 'vue'
import GetPermissionsInfo from "./get-permissions-info.vue";
import ViewPermissionsInfo from "./view-permissions-info.vue";

import ZyModal from "comps/common/ZyModal.vue";
import ZyToolButton from "comps/common/ZyToolButton.vue";
import ZyFittleRow from "comps/common/ZyFittleRow.vue";
import ZySearchForm from "comps/common/ZySearchForm.vue";

import {ZyConfirm, ZyNotification} from "libs/util.toast";
import {isEmptyObject} from "libs/util.common";
import {TimeUtils} from "libs/util.time";
import {hasPerms} from 'libs/util.common';

import {permissionsDelete, permissionsList, permissionsStop} from "api/modules/api.permissions";

const columns = [

  {title: "权限名称", width: 275, dataIndex: "name", key: "name",},

  {title: "权限标识", width: 275, dataIndex: "key", key: "key",},

  {title: "父级标识", dataIndex: "parent_key", key: "parent_key",},

  {title: "权限按钮", dataIndex: "auth", key: "auth", align: 'center'},
  {title: "排序", dataIndex: "sortOrder", key: "sortOrder", align: 'center'},

  {title: "状态", width: 100, dataIndex: "status", key: "status", align: 'center'},

  {title: "创建时间", dataIndex: "createdAt", key: "createdAt", align: 'center'},

  {title: '操作', width: 225, key: 'action', align: 'center', fixed: 'right'}
];

const state = reactive({
  show: {
    add: false,
    edit: false,
    view: false
  },
  editTitle: '编辑',
  activeComponent: null,
  // 暂存更新数据
  updateData: {},
  resetData: {},
  // 暂存查看数据
  viewData: {},
  // 请求参数
  query: {
    params: {},
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      hideOnSinglePage: true,
    },
    sort: {
      columnKey: "sortOrder",
      order: "ascend"
    }
  },
  dataList: [],
  // loading
  loading: {
    spinning: false,
    tip: '加载中'
  }
})

// 查询
const goPage = (num = 1) => {
  state.query.pagination.current = num;
  getDataList()
}
// 重置查询条件
const handleReset = () => {
  goPage()
}
// 分页
const pageChange = ({current, pageSize}) => {
  // 更新当前页码和每页条数
  state.query.pagination = reactive({
    current: current,
    pageSize: pageSize,
  });
  getDataList()
}
// 排序
const sorterChange = ({columnKey, order}) => {
  // 更新排序
  state.query.sort = reactive({
    current: columnKey,
    order: order,
  });
  getDataList()
}


const statusChange = (data) => {
  permissionsStop({_id: data._id}).then(res => {
    ZyNotification.success(data.status ? '启用成功' : '停用成功')
    goPage()
  })

}

function traverseTree(node) {
  // 处理当前节点
  node.createdAt = TimeUtils.formatTime(node.createdAt)
  node.updatedAt = TimeUtils.formatTime(node.updatedAt)
  // 递归遍历子节点
  if (node.children) {
    node.children.forEach(child => {
      traverseTree(child);
    });
  }
}

// 加载数据
const getDataList = () => {
  state.loading.spinning = true
  // 将响应式query返回起原始对象
  let p = toRaw(state.query)

  let res = {
    "status": 1,
    "message": "Success.",
    "data": {
      "result": [
        {
          "_id": "64a6767b2f517ae48b51de4a",
          "name": "首页",
          "key": "index",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "createdAt": "2023-07-06T08:08:27.735Z",
          "updatedAt": "2023-07-18T03:16:59.334Z",
          "disabled": false
        },
        {
          "_id": "64a676872f517ae48b51de50",
          "name": "系统管理",
          "key": "sys",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "createdAt": "2023-07-06T08:08:39.650Z",
          "updatedAt": "2023-07-06T13:26:57.493Z",
          "disabled": false,
          "children": [
            {
              "_id": "64a676942f517ae48b51de56",
              "name": "用户管理",
              "key": "sys:users",
              "parent_key": "sys",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-06T08:08:52.375Z",
              "updatedAt": "2023-09-11T01:55:57.012Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a676a62f517ae48b51de5c",
                  "name": "查询",
                  "key": "sys:users:list",
                  "parent_key": "sys:users",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T08:09:10.271Z",
                  "updatedAt": "2023-07-09T13:53:59.963Z",
                  "disabled": false
                },
                {
                  "_id": "64a676b72f517ae48b51de62",
                  "name": "增加",
                  "key": "sys:users:create",
                  "parent_key": "sys:users",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T08:09:27.173Z",
                  "updatedAt": "2023-07-06T14:41:34.107Z",
                  "disabled": false
                },
                {
                  "_id": "64a676ca2f517ae48b51de68",
                  "name": "删除",
                  "key": "sys:users:delete",
                  "parent_key": "sys:users",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T08:09:46.180Z",
                  "updatedAt": "2023-07-06T14:41:40.693Z",
                  "disabled": false
                },
                {
                  "_id": "64a676d82f517ae48b51de6e",
                  "name": "重置密码",
                  "key": "sys:users:reset",
                  "parent_key": "sys:users",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T08:10:00.965Z",
                  "updatedAt": "2023-07-06T14:41:54.406Z",
                  "disabled": false
                }
              ]
            },
            {
              "_id": "64a7799604246540f7286663",
              "name": "权限管理",
              "key": "sys:permissions",
              "parent_key": "sys",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T02:33:58.142Z",
              "updatedAt": "2023-07-07T02:33:58.142Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a77a0104246540f7286681",
                  "name": "停用",
                  "key": "sys:permissions:stop",
                  "parent_key": "sys:permissions",
                  "auth": true,
                  "sortOrder": null,
                  "status": true,
                  "createdAt": "2023-07-07T02:35:45.300Z",
                  "updatedAt": "2023-07-07T02:35:45.300Z",
                  "disabled": false
                },
                {
                  "_id": "64a6eca8bbab6245325057ee",
                  "name": "查询",
                  "key": "sys:permissions:list",
                  "parent_key": "sys:permissions",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:32:40.326Z",
                  "updatedAt": "2023-07-06T16:32:40.326Z",
                  "disabled": false
                },
                {
                  "_id": "64a6ecc0bbab6245325057f4",
                  "name": "增加",
                  "key": "sys:permissions:create",
                  "parent_key": "sys:permissions",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:33:04.782Z",
                  "updatedAt": "2023-07-06T16:33:04.782Z",
                  "disabled": false
                },
                {
                  "_id": "64a6ecdebbab6245325057fa",
                  "name": "删除",
                  "key": "sys:permissions:delete",
                  "parent_key": "sys:permissions",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:33:34.613Z",
                  "updatedAt": "2023-07-06T16:33:34.613Z",
                  "disabled": false
                },
                {
                  "_id": "64a6ecffbbab624532505800",
                  "name": "修改",
                  "key": "sys:permissions:update",
                  "parent_key": "sys:permissions",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:34:07.219Z",
                  "updatedAt": "2023-07-06T16:34:07.219Z",
                  "disabled": false
                }
              ]
            },
            {
              "_id": "64a7cbe6b85fe16110610cf5",
              "name": "操作日志",
              "key": "sys:users_opt_logs",
              "parent_key": "sys",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T08:25:10.645Z",
              "updatedAt": "2023-07-07T08:25:10.645Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a7cbe6b85fe16110610cf6",
                  "name": "查询",
                  "key": "sys:users_opt_logs:list",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T08:25:10.645Z",
                  "updatedAt": "2023-07-07T08:25:10.645Z",
                  "disabled": false
                },
                {
                  "_id": "64a7cbe6b85fe16110610cf7",
                  "name": "增加",
                  "key": "sys:users_opt_logs:create",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T08:25:10.645Z",
                  "updatedAt": "2023-07-07T08:25:10.645Z",
                  "disabled": false
                },
                {
                  "_id": "64a7cbe6b85fe16110610cf8",
                  "name": "删除",
                  "key": "sys:users_opt_logs:delete",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T08:25:10.645Z",
                  "updatedAt": "2023-07-07T08:25:10.645Z",
                  "disabled": false
                },
                {
                  "_id": "64a7cbe6b85fe16110610cf9",
                  "name": "更新",
                  "key": "sys:users_opt_logs:update",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T08:25:10.645Z",
                  "updatedAt": "2023-07-07T08:25:10.645Z",
                  "disabled": false
                },
                {
                  "_id": "64a7d30aacc04191a405fb61",
                  "name": "批量删除",
                  "key": "sys:users_opt_logs:deleteAll",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T08:55:38.696Z",
                  "updatedAt": "2023-07-09T13:57:08.966Z",
                  "disabled": false
                },
                {
                  "_id": "64aabc5804fd30a2ac31c2a9",
                  "name": "导出",
                  "key": "sys:users_opt_logs:export",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-09T13:55:36.412Z",
                  "updatedAt": "2023-07-09T13:55:36.412Z"
                },
                {
                  "_id": "64aabc6b04fd30a2ac31c2b5",
                  "name": "导入",
                  "key": "sys:users_opt_logs:import",
                  "parent_key": "sys:users_opt_logs",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-09T13:55:55.856Z",
                  "updatedAt": "2023-07-09T13:55:55.856Z"
                }
              ]
            },
            {
              "_id": "64b4c7dad6ac9bf24cecc6d1",
              "name": "资源管理",
              "key": "sys:resources",
              "parent_key": "sys",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "disabled": false,
              "createdAt": "2023-07-17T04:47:22.912Z",
              "updatedAt": "2023-07-17T04:47:22.912Z",
              "children": [
                {
                  "_id": "64b4c7dad6ac9bf24cecc6d2",
                  "name": "查询",
                  "key": "sys:resources:list",
                  "parent_key": "sys:resources",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-17T04:47:22.913Z",
                  "updatedAt": "2023-07-17T04:47:22.913Z"
                },
                {
                  "_id": "64b4c7dad6ac9bf24cecc6d3",
                  "name": "增加",
                  "key": "sys:resources:create",
                  "parent_key": "sys:resources",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-17T04:47:22.913Z",
                  "updatedAt": "2023-07-17T04:47:22.913Z"
                },
                {
                  "_id": "64b4c7dad6ac9bf24cecc6d4",
                  "name": "删除",
                  "key": "sys:resources:delete",
                  "parent_key": "sys:resources",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-17T04:47:22.913Z",
                  "updatedAt": "2023-07-17T04:47:22.913Z"
                },
                {
                  "_id": "64b4c7dad6ac9bf24cecc6d5",
                  "name": "更新",
                  "key": "sys:resources:update",
                  "parent_key": "sys:resources",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-07-17T04:47:22.913Z",
                  "updatedAt": "2023-07-17T04:47:22.913Z"
                }
              ]
            },
            {
              "_id": "64a6f171d2fac9dd58d3025c",
              "name": "角色管理",
              "key": "sys:roles",
              "parent_key": "sys",
              "auth": false,
              "sortOrder": 1,
              "status": true,
              "createdAt": "2023-07-06T16:53:05.026Z",
              "updatedAt": "2023-09-11T01:56:03.256Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a6f171d2fac9dd58d3025d",
                  "name": "查询",
                  "key": "sys:roles:list",
                  "parent_key": "sys:roles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:53:05.026Z",
                  "updatedAt": "2023-07-06T16:53:05.026Z",
                  "disabled": false
                },
                {
                  "_id": "64a6f171d2fac9dd58d3025e",
                  "name": "增加",
                  "key": "sys:roles:create",
                  "parent_key": "sys:roles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:53:05.026Z",
                  "updatedAt": "2023-07-06T16:53:05.026Z",
                  "disabled": false
                },
                {
                  "_id": "64a6f171d2fac9dd58d3025f",
                  "name": "删除",
                  "key": "sys:roles:delete",
                  "parent_key": "sys:roles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:53:05.026Z",
                  "updatedAt": "2023-07-06T16:53:05.026Z",
                  "disabled": false
                },
                {
                  "_id": "64a6f171d2fac9dd58d30260",
                  "name": "更新",
                  "key": "sys:roles:update",
                  "parent_key": "sys:roles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-06T16:53:05.026Z",
                  "updatedAt": "2023-07-06T16:53:05.026Z",
                  "disabled": false
                }
              ]
            }
          ]
        },
        {
          "_id": "64a6bce2210858fb6ec32f55",
          "name": "开发工具",
          "key": "dev",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "createdAt": "2023-07-06T13:08:50.188Z",
          "updatedAt": "2023-07-06T13:27:34.278Z",
          "disabled": false,
          "children": [
            {
              "_id": "64a784d104a94eaa96595abb",
              "name": "代码生成",
              "key": "dev:codes",
              "parent_key": "dev",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T03:21:53.616Z",
              "updatedAt": "2023-07-07T03:21:53.616Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a784d104a94eaa96595abc",
                  "name": "查询",
                  "key": "dev:codes:list",
                  "parent_key": "dev:codes",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T03:21:53.616Z",
                  "updatedAt": "2023-07-07T03:21:53.616Z",
                  "disabled": false
                },
                {
                  "_id": "64a784d104a94eaa96595abd",
                  "name": "创建",
                  "key": "dev:codes:singleCurdFrontAndBack",
                  "parent_key": "dev:codes",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T03:21:53.616Z",
                  "updatedAt": "2023-07-07T05:28:34.029Z",
                  "disabled": false
                },
                {
                  "_id": "64a784d104a94eaa96595abe",
                  "name": "删除",
                  "key": "dev:codes:delete",
                  "parent_key": "dev:codes",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T03:21:53.617Z",
                  "updatedAt": "2023-07-07T03:21:53.617Z",
                  "disabled": false
                },
                {
                  "_id": "64a784d104a94eaa96595abf",
                  "name": "批量删除",
                  "key": "dev:codes:deleteAll",
                  "parent_key": "dev:codes",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T03:21:53.617Z",
                  "updatedAt": "2023-07-07T05:28:50.417Z",
                  "disabled": false
                }
              ]
            },
            {
              "_id": "64a6ec18bbab6245325057dc",
              "name": "图标列表",
              "key": "dev:icon",
              "parent_key": "dev",
              "auth": false,
              "sortOrder": 1,
              "status": true,
              "createdAt": "2023-07-06T16:30:16.901Z",
              "updatedAt": "2023-07-07T03:22:12.747Z",
              "disabled": false
            }
          ]
        },
        {
          "_id": "64a7a633f97cdac3cb1bbbcf",
          "name": "页面示例",
          "key": "pages",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "createdAt": "2023-07-07T05:44:19.405Z",
          "updatedAt": "2023-07-07T05:44:19.405Z",
          "disabled": false,
          "children": [
            {
              "_id": "64a7a9dda971facd04696235",
              "name": "综合页面",
              "key": "pages:all",
              "parent_key": "pages",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T05:59:57.159Z",
              "updatedAt": "2023-07-07T05:59:57.159Z",
              "disabled": false
            }
          ]
        },
        {
          "_id": "64a7a67af97cdac3cb1bbbee",
          "name": "组件示例",
          "key": "components",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "createdAt": "2023-07-07T05:45:30.168Z",
          "updatedAt": "2023-07-07T05:45:30.168Z",
          "disabled": false,
          "children": [
            {
              "_id": "64a7a695f97cdac3cb1bbbf4",
              "name": "图表地图",
              "key": "components:echart",
              "parent_key": "components",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T05:45:57.351Z",
              "updatedAt": "2023-07-07T05:45:57.351Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a7a695f97cdac3cb1bbbf5",
                  "name": "贵州地图",
                  "key": "components:echart:guizhouMap",
                  "parent_key": "components:echart",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T05:45:57.351Z",
                  "updatedAt": "2023-07-07T05:46:19.623Z",
                  "disabled": false
                },
                {
                  "_id": "64a7a695f97cdac3cb1bbbf6",
                  "name": "中国地图",
                  "key": "components:echart:chinaMap",
                  "parent_key": "components:echart",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T05:45:57.351Z",
                  "updatedAt": "2023-07-07T05:46:33.902Z",
                  "disabled": false
                },
                {
                  "_id": "64a7a695f97cdac3cb1bbbf7",
                  "name": "世界地图",
                  "key": "components:echart:worldMap",
                  "parent_key": "components:echart",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T05:45:57.351Z",
                  "updatedAt": "2023-07-07T05:46:44.697Z",
                  "disabled": false
                },
                {
                  "_id": "64a7a695f97cdac3cb1bbbf8",
                  "name": "折线图",
                  "key": "components:echart:line",
                  "parent_key": "components:echart",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T05:45:57.352Z",
                  "updatedAt": "2023-07-07T05:46:56.584Z",
                  "disabled": false
                },
                {
                  "_id": "64a7a6e1f97cdac3cb1bbc16",
                  "name": "饼图",
                  "key": "components:echart:pie",
                  "parent_key": "components:echart",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T05:47:13.846Z",
                  "updatedAt": "2023-07-07T05:47:20.216Z",
                  "disabled": false
                }
              ]
            },
            {
              "_id": "64a7ab9da971facd04696299",
              "name": "富文本",
              "key": "components:editor",
              "parent_key": "components",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "createdAt": "2023-07-07T06:07:25.737Z",
              "updatedAt": "2023-07-07T06:07:25.737Z",
              "disabled": false,
              "children": [
                {
                  "_id": "64a7abb7a971facd0469629f",
                  "name": "Tinymce",
                  "key": "components:editor:Tinymce",
                  "parent_key": "components:editor",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T06:07:51.383Z",
                  "updatedAt": "2023-07-07T06:08:04.393Z",
                  "disabled": false
                },
                {
                  "_id": "64a7abe1a971facd046962ab",
                  "name": "Vditor",
                  "key": "components:editor:Vditor",
                  "parent_key": "components:editor",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T06:08:33.975Z",
                  "updatedAt": "2023-07-07T06:08:33.975Z",
                  "disabled": false
                },
                {
                  "_id": "64a7abefa971facd046962b1",
                  "name": "VMdEditor",
                  "key": "components:editor:VMdEditor",
                  "parent_key": "components:editor",
                  "auth": false,
                  "sortOrder": 0,
                  "status": true,
                  "createdAt": "2023-07-07T06:08:47.735Z",
                  "updatedAt": "2023-07-07T06:08:47.735Z",
                  "disabled": false
                }
              ]
            }
          ]
        },
        {
          "_id": "64cfada9c3794728bc32ac40",
          "name": "博客管理",
          "key": "blog",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "disabled": false,
          "createdAt": "2023-08-06T14:26:49.389Z",
          "updatedAt": "2023-08-06T14:26:49.389Z",
          "children": [
            {
              "_id": "64cfade2c3794728bc32ac4c",
              "name": "博文管理",
              "key": "blog:blog_articles",
              "parent_key": "blog",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "disabled": false,
              "createdAt": "2023-08-06T14:27:46.488Z",
              "updatedAt": "2023-08-06T14:27:46.488Z",
              "children": [
                {
                  "_id": "64cfade2c3794728bc32ac4d",
                  "name": "查询",
                  "key": "blog:blog_articles:list",
                  "parent_key": "blog:blog_articles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:27:46.488Z",
                  "updatedAt": "2023-08-06T14:27:46.488Z"
                },
                {
                  "_id": "64cfade2c3794728bc32ac4e",
                  "name": "增加",
                  "key": "blog:blog_articles:create",
                  "parent_key": "blog:blog_articles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:27:46.489Z",
                  "updatedAt": "2023-08-06T14:27:46.489Z"
                },
                {
                  "_id": "64cfade2c3794728bc32ac4f",
                  "name": "删除",
                  "key": "blog:blog_articles:delete",
                  "parent_key": "blog:blog_articles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:27:46.489Z",
                  "updatedAt": "2023-08-06T14:27:46.489Z"
                },
                {
                  "_id": "64cfade2c3794728bc32ac50",
                  "name": "更新",
                  "key": "blog:blog_articles:update",
                  "parent_key": "blog:blog_articles",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:27:46.489Z",
                  "updatedAt": "2023-08-06T14:27:46.489Z"
                }
              ]
            },
            {
              "_id": "64cfae09c3794728bc32ac5c",
              "name": "作品管理",
              "key": "blog:portfolios",
              "parent_key": "blog",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "disabled": false,
              "createdAt": "2023-08-06T14:28:25.623Z",
              "updatedAt": "2023-08-06T14:28:25.623Z",
              "children": [
                {
                  "_id": "64cfae09c3794728bc32ac5d",
                  "name": "查询",
                  "key": "blog:portfolios:list",
                  "parent_key": "blog:portfolios",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:28:25.623Z",
                  "updatedAt": "2023-08-06T14:28:25.623Z"
                },
                {
                  "_id": "64cfae09c3794728bc32ac5e",
                  "name": "增加",
                  "key": "blog:portfolios:create",
                  "parent_key": "blog:portfolios",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:28:25.623Z",
                  "updatedAt": "2023-08-06T14:28:25.623Z"
                },
                {
                  "_id": "64cfae09c3794728bc32ac5f",
                  "name": "删除",
                  "key": "blog:portfolios:delete",
                  "parent_key": "blog:portfolios",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:28:25.623Z",
                  "updatedAt": "2023-08-06T14:28:25.623Z"
                },
                {
                  "_id": "64cfae09c3794728bc32ac60",
                  "name": "更新",
                  "key": "blog:portfolios:update",
                  "parent_key": "blog:portfolios",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-06T14:28:25.624Z",
                  "updatedAt": "2023-08-06T14:28:25.624Z"
                }
              ]
            },
            {
              "_id": "64d1d19153d1c684a73c8412",
              "name": "留言管理",
              "key": "blog:messages",
              "parent_key": "blog",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "disabled": false,
              "createdAt": "2023-08-08T05:24:33.901Z",
              "updatedAt": "2023-08-08T05:24:33.901Z",
              "children": [
                {
                  "_id": "64d1d19153d1c684a73c8413",
                  "name": "查询",
                  "key": "blog:messages:list",
                  "parent_key": "blog:messages",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-08T05:24:33.901Z",
                  "updatedAt": "2023-08-08T05:24:33.901Z"
                },
                {
                  "_id": "64d1d19153d1c684a73c8414",
                  "name": "增加",
                  "key": "blog:messages:create",
                  "parent_key": "blog:messages",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-08T05:24:33.902Z",
                  "updatedAt": "2023-08-08T05:24:33.902Z"
                },
                {
                  "_id": "64d1d19153d1c684a73c8415",
                  "name": "删除",
                  "key": "blog:messages:delete",
                  "parent_key": "blog:messages",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-08T05:24:33.902Z",
                  "updatedAt": "2023-08-08T05:24:33.902Z"
                },
                {
                  "_id": "64d1d19153d1c684a73c8416",
                  "name": "更新",
                  "key": "blog:messages:update",
                  "parent_key": "blog:messages",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-08-08T05:24:33.902Z",
                  "updatedAt": "2023-08-08T05:24:33.902Z"
                }
              ]
            }
          ]
        },
        {
          "_id": "64fe8780857575ebf222ac7d",
          "name": "测试示例",
          "key": "test",
          "auth": false,
          "sortOrder": 0,
          "status": true,
          "disabled": false,
          "createdAt": "2023-09-11T03:20:32.189Z",
          "updatedAt": "2023-09-11T03:20:32.189Z",
          "children": [
            {
              "_id": "64fe88bc857575ebf222ac89",
              "name": "测试页面",
              "key": "test:page",
              "parent_key": "test",
              "auth": false,
              "sortOrder": 0,
              "status": true,
              "disabled": false,
              "createdAt": "2023-09-11T03:25:48.668Z",
              "updatedAt": "2023-09-11T03:25:48.668Z",
              "children": [
                {
                  "_id": "64fe88bc857575ebf222ac8a",
                  "name": "查询",
                  "key": "test:page:list",
                  "parent_key": "test:page",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-09-11T03:25:48.668Z",
                  "updatedAt": "2023-09-11T03:25:48.668Z"
                },
                {
                  "_id": "64fe88bc857575ebf222ac8b",
                  "name": "增加",
                  "key": "test:page:create",
                  "parent_key": "test:page",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-09-11T03:25:48.668Z",
                  "updatedAt": "2023-09-11T03:25:48.668Z"
                },
                {
                  "_id": "64fe88bc857575ebf222ac8c",
                  "name": "删除",
                  "key": "test:page:delete",
                  "parent_key": "test:page",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-09-11T03:25:48.669Z",
                  "updatedAt": "2023-09-11T03:25:48.669Z"
                },
                {
                  "_id": "64fe88bc857575ebf222ac8d",
                  "name": "更新",
                  "key": "test:page:update",
                  "parent_key": "test:page",
                  "auth": true,
                  "sortOrder": 0,
                  "status": true,
                  "disabled": false,
                  "createdAt": "2023-09-11T03:25:48.669Z",
                  "updatedAt": "2023-09-11T03:25:48.669Z"
                }
              ]
            }
          ]
        }
      ]
    },
    "time": 1694589329318
  }
  state.loading.spinning = false
  let datas = res.data.result
  // 遍历树状结构
  datas.forEach(node => {
    traverseTree(node);
  });

  state.dataList = datas

  /* permissionsList(p).then(res => {
       state.loading.spinning = false
       let datas = res.data.result
       // 遍历树状结构
       datas.forEach(node => {
           traverseTree(node);
       });

       state.dataList = datas
   }).catch(err => {
       state.loading.spinning = false
       console.log(err)
   })*/

}

// 处理表格变化事件
const handleTableChange = (paginationValue, filters, sorter) => {
  if (!isEmptyObject(paginationValue)) {
    pageChange(paginationValue)
  }
  if (!isEmptyObject(sorter)) {
    sorterChange(sorter)
  }
};


const goView = (row) => {
  state.show.view = true
  state.viewData = row
}


const goEdit = (row) => {
  state.show.edit = true
  row && row._id ? state.editTitle = '修改权限' : state.editTitle = '添加权限'
  state.updateData = row
}

// 验证权限标识默认有且仅有一个冒号 :
function hasSingleColon(str, num = 1) {
  const colonCount = (str.match(/:/g) || []).length;
  return colonCount === num;
}

const goDelete = (row) => {
  if (hasSingleColon(row.key, 0) || hasSingleColon(row.key, 1)) {
    ZyConfirm('确认删除该条数据以及所有子级数据?').then(ok => {
      ok && permissionsDelete(row).then(res => {
        ZyNotification.success('删除成功')
        goPage()
      })
    })
  } else {
    ZyConfirm('确认删除该条数据?').then(ok => {
      ok && permissionsDelete(row).then(res => {
        ZyNotification.success('删除成功')
        goPage()
      })
    })
  }

}
// 重置密码
const resetPassword = (data) => {
  state.resetData = data || {}
  state.show.reset = true
}
const close = (isSave) => {
  state.show.reset = false
  state.show.view = false
  state.show.edit = false
  isSave && goPage()
}

goPage()

</script>

<style scoped>

</style>
