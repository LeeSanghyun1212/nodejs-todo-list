import express from 'express';
import Todo from '../schemas/todo.schema.js';

const router = express.Router();

/** * 할일 등록 API */
router.post('/todos', async (req, res, next) => {
  const { value } = req.body;

  // 만약 value 데이터가 전달되지 않았을 때, 에러메시지 출력
  if (!value) {
    return res
      .status(400)
      .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
  }

  //findOne = 한개의 데이터만 조회한다.
  //sort = 정렬한다
  //exec = 몽구스로 조회하는 곳 마지막에 exec를 붙이면 깔끔하다(무조건 붙혀라)
  // 붙이지 않으면 await이 쓸모가 없어진다
  const todoMaxOrder = await Todo.findOne().sort('-order').exec();

  // 만약 todoMaxOrder가 존재한다면 1을 더해주고 없으면 1로 할당 (삼항연산자)
  const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

  // const todo는 todo를 실제 인스턴스 형식으로 만든 것
  const todo = new Todo({ value, order });
  // await todo.save()를 작성해야만 실제로 데이터베이스에 저장됨
  await todo.save();

  return res.status(201).json({ todo: todo });
});

/** 해야할 일 조회 */
router.get('/todos', async (req, res, next) => {
  const todos = await Todo.find().sort('-order').exec();

  return res.status(200).json({ todos });
});

/** 해야 할 일 수정 */
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    // 변경하려는 '해야할 일'의 내용을 변경합니다.
    currentTodo.value = value;
  }
  await currentTodo.save();

  return res.status(200).json({});
});
// 할 일 삭제
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 일 정보입니다.' });
  }
  // _id는
  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
//async, await에 대해서 찾아보기
