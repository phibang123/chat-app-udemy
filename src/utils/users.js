const users = []


const addUser = ({username,room,id}) =>
{
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //validator
  if (!username || !room)
  {
    return {
      error: "Username and room are require"
    }
  }
  //check user exesting 
  const existingUser = users.find((user) =>
  {
    return user.room === room && user.username === username
  }) 

  if (existingUser)
  {
    return {
      error: "Username is in use"
    }
  }

  const user = { id, username, room }
  users.push(user)
  return {user}
}

const removeUser = (id) =>
{
  const index = users.findIndex((user) => user.id === id)
  if (index !== -1)
  {
    //xóa xong trả ngược lại thằng dđó
    return users.splice(index,1)[0]
  }
}

const getUser = (id) =>
{
  return users.find((user) => user.id === id)
}

const getUserInRoom = (room) =>
{
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}




module.exports = {
  addUser,
  getUser,
  removeUser,
  getUserInRoom
}