<template>
  <section>
    <ZYSearchForm
        :formValue="state.query.params"
        @submit="goPage"
        @reset="handleReset"
    >
      <a-form-item name="name">
        <a-input v-model:value="state.query.params.name" allowClear placeholder="请输入名称" @pressEnter="goPage"
                 autocomplete="off"/>
      </a-form-item>
    </ZYSearchForm>
    <ZyFittleRow @add="goAdd" addAuth="sys:roles:create" :showDelete="false"/>
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
          <a-switch v-model:checked="record.status" :disabled="!hasPerms('sys:role:update')" checked-children="正常"
                    un-checked-children="停用"
                    @change="statusChange(record)"/>
        </template>
        <template v-else-if="column.key === 'action'">
          <ZyToolButton
              :showView="false"
              viewAuth="sys:roles:list"
              editAuth="sys:roles:update"
              deleteAuth="sys:roles:delete"
              editText="编辑 / 权限"
              :showEdit="record.status"
              @view="goView(record)"
              @edit="goEdit(record)"
              @delete="goDelete(record)"
          >
          </ZyToolButton>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <a-descriptions title="权限信息" bordered layout="vertical">
          <a-descriptions-item label="角色权限" :span="3">
            <a-tag color="#55acee" style="margin: 5px;cursor: pointer" v-copy="items"
                   v-for="(items,index) in record.perms"
                   :key="index">
              <template #icon>
                <IconFont type="icon-quanxianguanli"/>
              </template>
              {{ items }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </a-table>

    <ZyModal :minWidth="650" :show="state.show.add" title="新增角色" key="GetRolesInfo" @close="close">
      <AddRolesInfo @close="close"/>
    </ZyModal>
    <ZyModal :minWidth="650" :show="state.show.edit" title="编辑角色" key="GetRolesInfo" @close="close">
      <GetRolesInfo :updateData="state.updateData" @close="close"/>
    </ZyModal>
    <ZyModal :minWidth="650" :show="state.show.view" title="查看角色" key="GetRolesInfo" @close="close">
      <ViewRolesInfo :viewData="state.viewData" @close="close"/>
    </ZyModal>
  </section>

</template>

<script setup>
import {reactive, toRaw, onMounted} from 'vue'
import ZYSearchForm from "comps/common/ZySearchForm.vue";
import ZyModal from "comps/common/ZyModal.vue";
import ZyToolButton from "comps/common/ZyToolButton.vue";
import {ZyConfirm, ZyMessage, ZyNotification} from "libs/util.toast";
import {hasPerms, isEmptyObject} from "libs/util.common";
import ZyFittleRow from "comps/common/ZyFittleRow.vue";
import GetRolesInfo from "./get-roles-info.vue";
import AddRolesInfo from "./add-roles-info.vue";
import ViewRolesInfo from "./view-roles-info.vue";
import {rolesDelete, rolesList, rolesUpdate} from "api/modules/api.roles";
import {TimeUtils} from "libs/util.time";

const columns = [
  {title: '角色名称', dataIndex: 'roleName', key: 'roleName', align: 'center'},
  {title: '角色标识', dataIndex: 'roleAuth', key: 'roleAuth', align: ''},
  {title: '备注', dataIndex: 'remark', key: 'remark', align: ''},
  {title: '状态', dataIndex: 'status', key: 'status', align: 'center'},
  {title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', align: 'center'},
  {title: '操作', width: 225, key: 'action', align: 'center', fixed: 'right'}
];

const state = reactive({
  show: {
    add: false,
    edit: false,
    view: false
  },
  activeComponent: null,
  // 暂存更新数据
  updateData: {},
  // 暂存查看数据
  viewData: {},
  dataList: [],
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
  // 更新当前排序
  state.query.sort = reactive({
    current: current,
    order: order,
  });
  getDataList()
}
const statusChange = (data) => {
  rolesUpdate({_id: data._id, status: data.status}).then(res => {
    ZyNotification.success(data.status ? '启用成功' : '停用成功')
    goPage()
  })
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
        },
        {
          "_id": "64a426a56f4197cfc70375f6",
          "roleName": "普通管理员",
          "roleAuth": "NORMALL-ADMIN",
          "perms": [
            "index",
            "sys:users:list",
            "sys:roles:list",
            "sys:permissions:list"
          ],
          "remark": "拥有部分权限",
          "status": true,
          "createdAt": "2023-07-04T14:03:17.858Z",
          "updatedAt": "2023-07-06T16:53:42.888Z"
        },
        {
          "_id": "64a6e9c04ef9906878daeced",
          "roleName": "开发人员",
          "roleAuth": "DEV-ADMIN",
          "perms": [
            "index",
            "dev",
            "dev:codes",
            "dev:codes:delete",
            "dev:icon",
            "dev:codes:list",
            "dev:codes:singleCurdFrontAndBack",
            "dev:codes:deleteAll",
            "sys:resources",
            "sys:resources:list",
            "sys:resources:create",
            "sys:resources:delete",
            "sys:resources:update"
          ],
          "remark": "开发人员",
          "status": true,
          "createdAt": "2023-07-06T16:20:16.785Z",
          "updatedAt": "2023-07-17T04:48:00.257Z"
        },
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
      ],
      "current": 1,
      "pageSize": 10,
      "total": 4
    },
    "time": 1694589275807
  }
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

/*  rolesList(p).then(res => {
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

const goAdd = () => {
  state.show.add = true
}

const goEdit = (row) => {
  state.show.edit = true
  state.updateData = row
}

const goDelete = (row) => {
  ZyConfirm('确认删除该条数据?').then(ok => {
    ok && rolesDelete(row).then(res => {
      ZyNotification.success('删除成功')
      goPage()
    })
  })
}
const close = (isSave) => {
  state.show.add = false
  state.show.view = false
  state.show.edit = false
  isSave && goPage()
}

goPage()
</script>

<style scoped>

</style>
