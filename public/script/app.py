import todoist.api
api = todoist.TodoistAPI('dea91d4a7e4cdc0fffe7cc01776ba9e8901051d8')
api.sync()
print(api.state['projects'])