<template>
  <section>
    <ZySearchForm
        :formValue="state.query.params"
        @submit="goPage"
        @reset="handleReset"
    >
      <a-form-item name="name">
        <a-input v-model:value="state.query.params.username" allowClear placeholder="请输入用户名" @pressEnter="goPage"
                 autocomplete="off"/>
      </a-form-item>
    </ZySearchForm>
    <ZyFittleRow @add="goEdit"
                 addAuth="sys:user:create"
                 :showDelete="false"/>
    <a-table
        bordered
        :resizable="true"
        :loading="state.loading"
        :columns="columns"
        :row-key="record => record._id"
        :pagination="state.query.pagination"
        :expandedRowRender="state.expandedRowKeys"
        @expand="onExpand"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        :data-source="state.dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'avatar'">
          <a-image
              :width="40"
              :src="record.avatar"
          />
        </template>
        <template v-else-if="column.key === 'status'">
          <a-switch v-model:checked="record.status" :disabled="!hasPerms('sys:users:update')" checked-children="正常"
                    un-checked-children="停用"
                    @change="statusChange(record)"/>
        </template>
        <template v-else-if="column.key === 'action'">
          <ZyToolButton
              viewAuth="sys:user:list"
              editAuth="sys:user:update"
              deleteAuth="sys:user:delete"
              :showView="false"
              @view="goView(record)"
              :showEdit="record.status"
              @edit="goEdit(record)"
              @delete="goDelete(record)"
          >
            <a-button type="primary"
                      size="small"
                      @click="resetPassword(record)"
                      v-permission="'sys:users:reset'">重置密码
            </a-button>
          </ZyToolButton>
        </template>
      </template>
    <!--  <template #expandedRowRender="{ record }">
        <a-descriptions title="权限信息" bordered v-for="(item,index) in record.role" :key="index">
          <a-descriptions-item label="角色名称">{{ item.roleName }}</a-descriptions-item>
          <a-descriptions-item label="角色标识">{{ item.roleAuth }}</a-descriptions-item>
          <a-descriptions-item label="角色状态">
            <a-badge :status="item.status?'success':'error'" :text="item.status?'正常':'停用'"/>
          </a-descriptions-item>
          <a-descriptions-item label="角色备注" :span="3">{{ item.remark || '-' }}</a-descriptions-item>
          <a-descriptions-item label="角色权限">
            <a-tag color="#55acee" style="margin: 5px;cursor: pointer" v-for="(items,index) in item.perms" :key="index">
              <template #icon>
                <IconFont type="icon-quanxianguanli"/>
              </template>
              {{ items }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </template>
-->
    </a-table>
    <ZyModal :minWidth="650" :show="state.show.edit" :title="state.editTitle" key="GetUserInfo"
             @close="close">
      <GetUserInfo :updateData="state.updateData" @close="close"/>
    </ZyModal>
    <ZyModal :minWidth="650" :show="state.show.view" title="查看用户" key="ViewUserInfo" @close="close">
      <ViewUserInfo :viewData="state.viewData" @close="close"/>
    </ZyModal>
    <ZyModal :minWidth="650" :show="state.show.reset" title="重置密码" key="ResetUserInfo"
             @close="close">
      <ResetUserInfo :updateData="state.resetData" @close="close"/>
    </ZyModal>
  </section>

</template>

<script setup>
import {reactive, toRaw} from 'vue'
import {ZyConfirm, ZyNotification} from "../../../libs/util.toast";
import {isEmptyObject} from "../../../libs/util.common";
import GetUserInfo from "./get-users-info.vue";
import ZyModal from "../../../components/common/ZyModal.vue";
import ViewUserInfo from "./view-users-info.vue";
import ZyToolButton from "../../../components/common/ZyToolButton.vue";
import ZyFittleRow from "../../../components/common/ZyFittleRow.vue";
import ZySearchForm from "../../../components/common/ZySearchForm.vue";
import {usersDelete, usersList, usersUpdate} from "../../../api/modules/api.users";
import {TimeUtils} from "../../../libs/util.time";
import ResetUserInfo from "./reset-users-info.vue";
import {hasPerms} from '../../../libs/util.common';

const columns = [
  {title: '头像', dataIndex: 'avatar', key: 'avatar', align: 'center'},
  {title: '昵称', dataIndex: 'nickname', key: 'nickname', align: 'center'},
  {title: '用户名', dataIndex: 'username', key: 'username', align: 'center'},
  // {title: '密码', width: 180, dataIndex: 'password', key: 'password', ellipsis: true, align: 'center'},
  {title: '备注', dataIndex: 'remark', key: 'remark', align: ''},
  {title: '账号状态', dataIndex: 'status', key: 'status', align: 'center'},
  {
    title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', sorter: (a, b) => {
    }, align: 'center'
  },
  {title: '操作', width: 225, key: 'action', align: 'center', fixed: 'right'}
];

const state = reactive({
  show: {
    add: false,
    edit: false,
    view: false
  },
  editTitle: '编辑用户',
  activeComponent: null,
  expandedRowKeys: [],
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
      columnKey: "createdAt",
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
const onExpand = (bool, row) => {

}

const statusChange = (data) => {
  usersUpdate({_id: data._id, status: data.status}).then(res => {
    ZyNotification.success(data.status ? '启用成功' : '停用成功')
    goPage()
  })

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
          "_id": "64a7aab3a971facd0469625d",
          "avatar": "http://localhost:3089/v1/common/files/preview/img/1694395434026.webp",
          "username": "visitor",
          "nickname": "亡命之徒",
          "password": "$2a$10$d0MQyKMyvNcX8whJsF7O0OLqulGKo3GE0hS/WqoGFKpU.dmFRIHFO",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "createdAt": "2023-07-07T06:03:31.690Z",
          "updatedAt": "2023-09-11T01:23:55.237Z",
          "type": "admin",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64aabf3d28f413f08d51cc00",
          "avatar": "http://localhost:3089/v1/common/files/preview/img/1694395422575.png",
          "username": "admin",
          "nickname": "ZY·Admin",
          "password": "$2a$10$hdgL5ydnB8oLLcrgwjXdouAaZV/by32gWPOBiMl3wwFEzSVmdTvtG",
          "roleId": "64a423816f4197cfc70375e3",
          "status": true,
          "createdAt": "2023-07-09T14:07:57.766Z",
          "updatedAt": "2023-09-11T01:23:43.856Z",
          "type": "admin",
          "email": "1840354092@qq.com",
          "role": [
            {
              "_id": "64a423816f4197cfc70375e3",
              "roleName": "超级管理员",
              "roleAuth": "SUPER-ADMIN",
              "perms": [
                "*"
              ],
              "remark": "拥有所有权限",
              "status": true,
              "createdAt": "2023-07-04T13:49:53.993Z",
              "updatedAt": "2023-07-04T13:50:42.566Z"
            }
          ]
        },
        {
          "_id": "64d0a524050d4e56664640a3",
          "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354099@qq.com&s=100",
          "username": "1840354099@qq.com",
          "nickname": "BraveTiger",
          "password": "$2a$10$8Py3q427e4aOM3TSWDD68uNSjZMe/GYJcDGsClhIiy6LdBnJyJDaK",
          "email": "1840354099@qq.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:02:44.055Z",
          "updatedAt": "2023-08-07T08:02:44.055Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a544050d4e56664640aa",
          "avatar": "https://q1.qlogo.cn/g?b=qq&nk=18403099@qq.com&s=100",
          "username": "18403099@qq.com",
          "nickname": "LovelyLion",
          "password": "$2a$10$wWHE4VDS/QzWmG4tjg16TeGoOoILOQGpDCFzoiAMKNrlF1TOwX24C",
          "email": "18403099@qq.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:03:16.380Z",
          "updatedAt": "2023-08-07T08:03:16.380Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a556050d4e56664640b1",
          "avatar": "https://gravatar.kuibu.net/avatar/703e25762b056e4da576c886e1059479?s=100",
          "username": "18403099@xxx.com",
          "nickname": "LovelyLion",
          "password": "$2a$10$9Cdw1wgeqF9B8ULJoIrV9uihSs8AejRUIkBE8nU5fXUZz5oCRhpAC",
          "email": "18403099@xxx.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:03:34.486Z",
          "updatedAt": "2023-08-07T08:03:34.486Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a6c3571bc80e84717c2a",
          "avatar": "https://gravatar.kuibu.net/avatar/860254b3da9c08b769e5a62ae9628282?s=100",
          "username": "18003099@xxx.com",
          "nickname": "LovelyLion",
          "password": "$2a$10$Udf3tAP0IE5y4Dci4kmGl.Oc.6keOGqq035QAXXLGuCFOsR8pJts6",
          "email": "18003099@xxx.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:09:39.553Z",
          "updatedAt": "2023-08-07T08:09:39.553Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a6cc571bc80e84717c31",
          "avatar": "https://gravatar.kuibu.net/avatar/32ad41830da9a7edab6cea138ff1ca44?s=100",
          "username": "1800303299@xxx.com",
          "nickname": "LovelyLion",
          "password": "$2a$10$D2Y1kwDXqohcgR7CPG7Ov.GNFg/pwVPvaRWTwBlzxxf/5/PJ84JzC",
          "email": "1800303299@xxx.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:09:48.789Z",
          "updatedAt": "2023-08-07T08:09:48.789Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a859ccf7303b30150025",
          "avatar": "https://gravatar.kuibu.net/avatar/88361aff47cbf913225d05f04f8d108a?s=100",
          "username": "1840354095@xxx.com",
          "nickname": "Contact Me",
          "password": "$2a$10$fGTwZlLg2R9KbpulSakGWOJYpe7QiSZO5xGfIQV4KfNKmcz8HsSFy",
          "email": "1840354095@xxx.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "www.zhouyi.run",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:16:25.352Z",
          "updatedAt": "2023-08-07T08:16:25.352Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0a863ccf7303b3015002c",
          "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354095@qq.com&s=100",
          "username": "1840354095@qq.com",
          "nickname": "Contact Me",
          "password": "$2a$10$epwgGKjjO74kGY8QTNpiXuUebTaDcBVJKA4bDO5ueazHgv4xrTOqG",
          "email": "1840354095@qq.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "https://blog.dandyweng.com/messages/",
          "platform": "Chrome.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T08:16:35.554Z",
          "updatedAt": "2023-08-07T08:16:35.554Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        },
        {
          "_id": "64d0fc4e98c726a2d735bc4f",
          "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354093@qq.com&s=100",
          "username": "1840354093@qq.com",
          "nickname": "王俊凯",
          "password": "$2a$10$MNNXu8zdOGg21V73ucSm4evgoFydreyvctqtQSxl2GzMPgk3VdYdG",
          "email": "1840354093@qq.com",
          "roleId": "64a7aa20a971facd04696242",
          "status": true,
          "type": "user",
          "website": "",
          "platform": "Edge.v115",
          "userIp": "0.0.0.0",
          "address": "保留地址",
          "createdAt": "2023-08-07T14:14:38.633Z",
          "updatedAt": "2023-08-08T05:16:30.516Z",
          "role": [
            {
              "_id": "64a7aa20a971facd04696242",
              "roleName": "访客",
              "roleAuth": "VISITOR-ADMIN",
              "perms": [
                "index",
                "components:echart:chinaMap",
                "components:echart:worldMap",
                "components:echart:line",
                "components:echart:pie",
                "pages",
                "pages:all",
                "dev:icon",
                "dev:codes:list",
                "components:editor",
                "components:editor:Tinymce",
                "components:editor:Vditor",
                "components:editor:VMdEditor",
                "components",
                "components:echart",
                "components:echart:guizhouMap",
                "sys:permissions:list",
                "blog:blog_articles:list",
                "blog:portfolios:list",
                "blog:messages:list",
                "blog:messages:delete"
              ],
              "remark": "一般访客，更多的是有查看权限",
              "status": true,
              "createdAt": "2023-07-07T06:01:04.121Z",
              "updatedAt": "2023-08-08T05:25:44.071Z"
            }
          ]
        }
      ],
      "current": 1,
      "pageSize": 10,
      "total": 21
    },
    "time": 1694589183009
  }

  state.loading.spinning = false
  // let datas = res.data.result
  let datas = [
    {
      "_id": "64a7aab3a971facd0469625d",
      "avatar": "http://localhost:3089/v1/common/files/preview/img/1694395434026.webp",
      "username": "visitor",
      "nickname": "亡命之徒",
      "password": "$2a$10$d0MQyKMyvNcX8whJsF7O0OLqulGKo3GE0hS/WqoGFKpU.dmFRIHFO",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "createdAt": "2023-07-07T06:03:31.690Z",
      "updatedAt": "2023-09-11T01:23:55.237Z",
      "type": "admin",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64aabf3d28f413f08d51cc00",
      "avatar": "http://localhost:3089/v1/common/files/preview/img/1694395422575.png",
      "username": "admin",
      "nickname": "ZY·Admin",
      "password": "$2a$10$hdgL5ydnB8oLLcrgwjXdouAaZV/by32gWPOBiMl3wwFEzSVmdTvtG",
      "roleId": "64a423816f4197cfc70375e3",
      "status": true,
      "createdAt": "2023-07-09T14:07:57.766Z",
      "updatedAt": "2023-09-11T01:23:43.856Z",
      "type": "admin",
      "email": "1840354092@qq.com",
      "role": [
        {
          "_id": "64a423816f4197cfc70375e3",
          "roleName": "超级管理员",
          "roleAuth": "SUPER-ADMIN",
          "perms": [
            "*"
          ],
          "remark": "拥有所有权限",
          "status": true,
          "createdAt": "2023-07-04T13:49:53.993Z",
          "updatedAt": "2023-07-04T13:50:42.566Z"
        }
      ]
    },
    {
      "_id": "64d0a524050d4e56664640a3",
      "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354099@qq.com&s=100",
      "username": "1840354099@qq.com",
      "nickname": "BraveTiger",
      "password": "$2a$10$8Py3q427e4aOM3TSWDD68uNSjZMe/GYJcDGsClhIiy6LdBnJyJDaK",
      "email": "1840354099@qq.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:02:44.055Z",
      "updatedAt": "2023-08-07T08:02:44.055Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a544050d4e56664640aa",
      "avatar": "https://q1.qlogo.cn/g?b=qq&nk=18403099@qq.com&s=100",
      "username": "18403099@qq.com",
      "nickname": "LovelyLion",
      "password": "$2a$10$wWHE4VDS/QzWmG4tjg16TeGoOoILOQGpDCFzoiAMKNrlF1TOwX24C",
      "email": "18403099@qq.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:03:16.380Z",
      "updatedAt": "2023-08-07T08:03:16.380Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a556050d4e56664640b1",
      "avatar": "https://gravatar.kuibu.net/avatar/703e25762b056e4da576c886e1059479?s=100",
      "username": "18403099@xxx.com",
      "nickname": "LovelyLion",
      "password": "$2a$10$9Cdw1wgeqF9B8ULJoIrV9uihSs8AejRUIkBE8nU5fXUZz5oCRhpAC",
      "email": "18403099@xxx.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:03:34.486Z",
      "updatedAt": "2023-08-07T08:03:34.486Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a6c3571bc80e84717c2a",
      "avatar": "https://gravatar.kuibu.net/avatar/860254b3da9c08b769e5a62ae9628282?s=100",
      "username": "18003099@xxx.com",
      "nickname": "LovelyLion",
      "password": "$2a$10$Udf3tAP0IE5y4Dci4kmGl.Oc.6keOGqq035QAXXLGuCFOsR8pJts6",
      "email": "18003099@xxx.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:09:39.553Z",
      "updatedAt": "2023-08-07T08:09:39.553Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a6cc571bc80e84717c31",
      "avatar": "https://gravatar.kuibu.net/avatar/32ad41830da9a7edab6cea138ff1ca44?s=100",
      "username": "1800303299@xxx.com",
      "nickname": "LovelyLion",
      "password": "$2a$10$D2Y1kwDXqohcgR7CPG7Ov.GNFg/pwVPvaRWTwBlzxxf/5/PJ84JzC",
      "email": "1800303299@xxx.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:09:48.789Z",
      "updatedAt": "2023-08-07T08:09:48.789Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a859ccf7303b30150025",
      "avatar": "https://gravatar.kuibu.net/avatar/88361aff47cbf913225d05f04f8d108a?s=100",
      "username": "1840354095@xxx.com",
      "nickname": "Contact Me",
      "password": "$2a$10$fGTwZlLg2R9KbpulSakGWOJYpe7QiSZO5xGfIQV4KfNKmcz8HsSFy",
      "email": "1840354095@xxx.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "www.zhouyi.run",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:16:25.352Z",
      "updatedAt": "2023-08-07T08:16:25.352Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0a863ccf7303b3015002c",
      "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354095@qq.com&s=100",
      "username": "1840354095@qq.com",
      "nickname": "Contact Me",
      "password": "$2a$10$epwgGKjjO74kGY8QTNpiXuUebTaDcBVJKA4bDO5ueazHgv4xrTOqG",
      "email": "1840354095@qq.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "https://blog.dandyweng.com/messages/",
      "platform": "Chrome.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T08:16:35.554Z",
      "updatedAt": "2023-08-07T08:16:35.554Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    },
    {
      "_id": "64d0fc4e98c726a2d735bc4f",
      "avatar": "https://q1.qlogo.cn/g?b=qq&nk=1840354093@qq.com&s=100",
      "username": "1840354093@qq.com",
      "nickname": "王俊凯",
      "password": "$2a$10$MNNXu8zdOGg21V73ucSm4evgoFydreyvctqtQSxl2GzMPgk3VdYdG",
      "email": "1840354093@qq.com",
      "roleId": "64a7aa20a971facd04696242",
      "status": true,
      "type": "user",
      "website": "",
      "platform": "Edge.v115",
      "userIp": "0.0.0.0",
      "address": "保留地址",
      "createdAt": "2023-08-07T14:14:38.633Z",
      "updatedAt": "2023-08-08T05:16:30.516Z",
      "role": [
        {
          "_id": "64a7aa20a971facd04696242",
          "roleName": "访客",
          "roleAuth": "VISITOR-ADMIN",
          "perms": [
            "index",
            "components:echart:chinaMap",
            "components:echart:worldMap",
            "components:echart:line",
            "components:echart:pie",
            "pages",
            "pages:all",
            "dev:icon",
            "dev:codes:list",
            "components:editor",
            "components:editor:Tinymce",
            "components:editor:Vditor",
            "components:editor:VMdEditor",
            "components",
            "components:echart",
            "components:echart:guizhouMap",
            "sys:permissions:list",
            "blog:blog_articles:list",
            "blog:portfolios:list",
            "blog:messages:list",
            "blog:messages:delete"
          ],
          "remark": "一般访客，更多的是有查看权限",
          "status": true,
          "createdAt": "2023-07-07T06:01:04.121Z",
          "updatedAt": "2023-08-08T05:25:44.071Z"
        }
      ]
    }
  ]
  for (const data of datas) {
    data.createdAt = TimeUtils.formatTime(data.createdAt)
    data.updatedAt = TimeUtils.formatTime(data.updatedAt)
  }
  state.dataList = datas
  state.query.pagination.total = res.data.total
  state.query.pagination.current = res.data.current
  state.query.pagination.pageSize = res.data.pageSize

 /* usersList(p).then(res => {
    state.loading.spinning = false
    let datas = res.data.result
    for (const data of datas) {
      data.createdAt = TimeUtils.formatTime(data.createdAt)
      data.updatedAt = TimeUtils.formatTime(data.updatedAt)
    }
    state.dataList = datas
    state.query.pagination.total = res.data.total
    state.query.pagination.current = res.data.current
    state.query.pagination.pageSize = res.data.pageSize
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
  row && row._id ? state.editTitle = '修改用户' : state.editTitle = '添加用户'
  state.updateData = row
}

const goDelete = (row) => {
  ZyConfirm('确认删除该条数据?').then(ok => {
    ok && usersDelete(row).then(res => {
      ZyNotification.success('删除成功')
      goPage()
    }).catch(err => {
      ZyNotification.error('操作失败')
      console.log(err)
    })
  })
}
// 重置密码
const resetPassword = (data) => {
  state.resetData = data || {}
  state.show.reset = true
}
const close = (isSave) => {
  state.show.add = false
  state.show.reset = false
  state.show.view = false
  state.show.edit = false
  isSave && goPage()
}

goPage()

</script>

<style scoped>

</style>
