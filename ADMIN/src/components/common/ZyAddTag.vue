<template>
  <div>
    <template v-for="(tag, index) in state.tags" :key="tag">
      <a-tooltip v-if="tag.length > 20" :title="tag">
        <a-tag closable @close="handleClose(tag)" color="#f50" style="margin: 5px">
          {{ `${tag.slice(0, 20)}...` }}
        </a-tag>
      </a-tooltip>
      <a-tag v-else closable color="#f50" style="margin: 5px" @close="handleClose(tag)">
        {{ tag }}
      </a-tag>
    </template>
    <a-input
        v-if="state.inputVisible && !disAdd"
        ref="inputRef"
        v-model:value="state.inputValue"
        type="text"
        size="small"
        :style="{ width: '100px' }"
        @blur="handleInputConfirm"
        @keyup.enter="handleInputConfirm"
    />
    <a-tag v-else style="background: #fff; border-style: dashed" @click="showInput">
      <PlusOutlined/>
      添加
    </a-tag>
  </div>
</template>

<script setup>
import {ref, reactive, nextTick} from 'vue';
import {PlusOutlined} from "@ant-design/icons-vue";

const { tags: initialTags, disAdd } = defineProps(["tags", "disAdd"]);

const emit = defineEmits(["update:tags"]);

const inputRef = ref();
const state = reactive({
  tags: initialTags,
  inputVisible: false,
  inputValue: '',
});

const handleClose = (removedTag) => {
  const tags = state.tags.filter((tag) => tag !== removedTag);
  state.tags = tags;
  emit('update:tags', tags);
};

const showInput = () => {
  if (disAdd) return
  state.inputVisible = true;
  nextTick(() => {
    inputRef.value.focus();
  });
};

const handleInputConfirm = () => {
  const inputValue = state.inputValue;
  let tags = state.tags;
  if (inputValue && tags.indexOf(inputValue) === -1) {
    tags = [...tags, inputValue];
  }
  emit('update:tags', tags);
  Object.assign(state, {
    tags,
    inputVisible: false,
    inputValue: '',
  });
};
</script>
