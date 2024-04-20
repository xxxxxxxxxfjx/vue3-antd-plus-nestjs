import {defineStore} from 'pinia';
import {useRouter} from 'vue-router';
import {useDbStore} from './db.js'
import dbUtils from '../libs/util.strotage.js'
import {useTabsStore} from './tabs';
import {authLogin} from "../api/modules/api.auth";
import {ZyNotification} from "../libs/util.toast";
import {rolesFindOne} from "../api/modules/api.roles";
import {usersFindOne} from "../api/modules/api.users";


export const useAuthStore = defineStore('auth', () => {
    let router = useRouter()
    const db = useDbStore();
    // 重置tabs
    let tabStore = useTabsStore()

    async function logout() {
        // 执行退出登录逻辑，例如清除用户凭证和重置用户状态等
        // ...
        // 重置tabs
        tabStore.resetTabs()
        // 清除所有缓存
        db.removeAllInfo()

        // 导航到登录页或其他适当的页面
        await router.replace('/login');

    }

    async function login(value) {
        // 执行登录逻辑
        // ...
        return new Promise((resolve, reject) => {
            let res = {
                "status": 1,
                "message": "登录成功.",
                "data": {
                    "_id": "64aabf3d28f413f08d51cc00",
                    "username": "admin",
                    "nickname": "ZY·Admin",
                    "roleId": "64a423816f4197cfc70375e3",
                    "status": true,
                    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGFhYmYzZDI4ZjQxM2YwOGQ1MWNjMDAiLCJ1c2VybmFtZSI6ImFkbWluIiwibmlja25hbWUiOiJaWcK3QWRtaW4iLCJyb2xlSWQiOiI2NGE0MjM4MTZmNDE5N2NmYzcwMzc1ZTMiLCJzdGF0dXMiOnRydWUsImlhdCI6MTY5NDU4ODU0MywiZXhwIjoxNjk0ODQ3NzQzfQ.Gd0dO4Ib_g1CXt7z7gXMkAeQ0qAcnLmL9ZNLuiNfcDw"
                },
                "time": 1694588543531
            }
            dbUtils.clear()
            dbUtils.set('token', res.data.token)

            let user={
                "status": 1,
                "message": "成功.",
                "data": {
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
                    "email": "1840354092@qq.com"
                },
                "time": 1694588543551
            }
            // 存储用户信息
            dbUtils.set('userInfo', {
                ...user.data
            })
            let role={
                "status": 1,
                "message": "查询成功.",
                "data": {
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
                "time": 1694588543552
            }

            // 暂存权限信息
            setPerm(role.data.perms)
            // 导航到登录页或其他适当的页面
            resolve({...res.data, ...role.data})

            ZyNotification.success(`欢迎: ${res.data.nickname}`)
            router.replace('/');


           /* authLogin(value).then(res => {

                dbUtils.clear()
                dbUtils.set('token', res.data.token)

                usersFindOne({_id: res.data._id}).then(user=>{
                    // 存储用户信息
                    dbUtils.set('userInfo', {
                        ...user.data
                    })
                })
                rolesFindOne({id: res.data.roleId}).then(role => {
                    // 暂存权限信息
                    setPerm(role.data.perms)
                    // 导航到登录页或其他适当的页面
                    resolve({...res.data, ...role.data})

                    ZyNotification.success(`欢迎: ${res.data.nickname}`)
                    router.replace('/');
                })
            }).catch(err => {
                reject(err)
            })*/
        })
    }

    // 获取用户的角色权限列表数据 并且存储本地
    async function setPerm(value) {
        dbUtils.set('perms', value)
    }

    return {
        setPerm,
        logout,
        login,
    };

})
