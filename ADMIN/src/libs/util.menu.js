import {useRouter} from 'vue-router'
import dbUtils from "./util.strotage";

/**
 * 检查路由对象是否具有权限
 * @param {Array} perms - 权限列表
 * @param {Object} route - 路由对象
 * @returns {boolean} - 是否具有权限
 */
function hasPermission(perms, route) {
    if (route.meta && route.meta.perms) {
        // 如果路由对象定义了 meta 属性或者定义 meta.perms 属性，那么就根据权限值来判断是否具有权限
        return perms.some(perm => route.meta.perms.includes(perm))
    } else {
        // 如果路由对象没有定义 meta 属性或者没有定义 meta.perms 属性，那么默认认为具有权限，返回 true。
        return true
    }
}

/**
 * 根据权限列表筛选异步路由配置
 * @param {Array} routes - 路由配置表
 * @param {Array} perms - 权限列表
 * @returns {Array} - 筛选后的路由配置
 */
function filterAsyncRouter(routes, perms) {
    return routes.reduce((res, route) => {
        const tmp = { ...route }; // 创建临时变量 tmp，避免修改原始对象

        // 判断路由是否有子路由并且不是隐藏的
        if (!tmp.hidden && tmp.children) {
            tmp.children = filterAsyncRouter(tmp.children, perms);

            // 如果子路由不为空，才加入结果数组
            if (tmp.children.length > 0) {
                res.push(tmp);
            }
        } else if (!tmp.hidden && (!perms || hasPermission(perms, tmp))) {
            // 没有子路由的情况，检查权限并且没有隐藏
            res.push(tmp);
        }

        return res;
    }, []);
}



export const menuList = function () {
    const asyncRoutes = useRouter().options.routes[0].children.filter(e => !e.hidden)
    //筛选路由表
    const permissionList = dbUtils.get('perms');
    if (!permissionList.length) {
        // 清空所有缓存数据
        dbUtils.clear()
        // 重置路由重新登录
        return useRouter().replace('/login')
    }
    let accessedRouters

    if (permissionList.includes('*')) {
        // 如果是超级管理员则无需权限验证
        accessedRouters = filterAsyncRouter(asyncRoutes)
    } else {
        accessedRouters = filterAsyncRouter(asyncRoutes, permissionList);
    }
    return accessedRouters
}




