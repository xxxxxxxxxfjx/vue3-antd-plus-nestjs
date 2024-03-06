<template>
  <a-select
      ref="select"
      v-model:value="value1"
      style="width: 120px"
      :options="options"
      :allowClear="true"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      @clear="handleChange"
      @change="handleChange"
  >
  </a-select>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';
import {dictionariesFindType} from '../../api/modules/api.dictionaries';

const value1 = ref(null); // 将初始值设置为 null
const props = defineProps({
  allowClear: {
    type: Boolean,
    default: () => true,
  },
  placeholder: {
    type: String,
    default: () => '请选择',
  },
  disabled: {
    type: Boolean,
    default: () => false,
  },
  code: {
    type: String,
    default: () => '',
  },
  value: {
    type: Number,
  },
});
const emit = defineEmits(['update:value','change']);

const options = ref([]);

const getDataList = () => {
  dictionariesFindType({dict_code: props.code}).then((res) => {
    for (const item of res.data) {
      options.value.push({
        value: item.dict_value,
        label: item.dict_label,
      });
    }
    // 更新 value1 的值为 props.value
    value1.value = props.value;
  });
};

// 在组件挂载后调用 getDataList
onMounted(() => {
  getDataList();
});

// 监听 props.value 的变化，并更新 value1
watch(() => props.value, () => {
  value1.value = props.value;
});

const handleChange = (value) => {
  // 触发父组件的 update:value 事件，将值传递给父组件
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped>

</style>
