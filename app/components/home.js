import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ListView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {manager, ReactCBLite} from 'react-native-couchbase-lite';

const localDBUrl= 'http://localhost:5984/';
const localDBName= 'todo_app';
const remoteDBUrl= 'http://localhost:4984/';
const remoteDBName= 'db';

let database = null;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  rowContainer: {
    padding: 10
  },
  rowTitle: {
    color: '#48BBEC',
    fontSize: 16
  },
  rowContent: {
    fontSize: 19
  },

  mainContainer: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#48BBEC'
  },
  searchInput: {
    height: 50,
    padding: 4,
    marginRight: 5,
    fontSize: 23,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white',
    margin: 5
  },
  buttonText: {
    fontSize: 18,
    color: '#111',
    alignSelf: 'center'
  },
  button: {
    height: 45,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      newTodo: '',
      todos: [],
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
    })
  }

  componentDidMount() {
    ReactCBLite.init((url) => {
      database = new manager(url, localDBName);
      database.createDatabase()
        .then(res => {
          console.log('db created');
          this.getTodosFromApi();
          database.replicate(localDBName, 'http://10.111.4.12:4984/db',{continuous: true}).then(res => console.log(res));
          // database.replicate('http://10.111.4.12:4984/db', localDBName,{continuous: true}).then(res => console.log(res));
        })
        .catch(ex => console.log('error creating db',ex));
    })
  }

  getTodosFromApi() {
    database.getDocuments({include_docs: true})
      .then(res => {
        console.log(res)
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(res.rows)
        });
      })
      .catch(ex => console.log('error getting data',ex));
  }

  handleTodoChange(event) {
    this.setState({
      newTodo: event.nativeEvent.text
    });
  }

  handleSave() {
    if (database !== null) {
      var doc = {
        title: this.state.newTodo,
        type: 'list'
      }
      console.log('new doc', doc)
      database.createDocument(doc)
        .then( res => {
          console.log(res)
          this.getTodosFromApi();
          this.setState({newTodo:''})
        })
        .catch(ex => console.log('err cre',ex))
    } else {
      const todos = this.state.todos;
      todos.push({
        title: this.state.newTodo,
        type: 'list'
      })
      this.setState({todos: todos})
    }
  }

  renderItem(item) {
    const doc = item.doc || {};
    return (
      <View>
        <Text>{doc.title || 'tit'}</Text>
      </View>
    );
  }

  render() {

    return (
      <View style={styles.mainContainer}>
        <TextInput
          ref='inputText'
          value={this.state.newTodo}
          onChange={this.handleTodoChange.bind(this)}
          style={styles.searchInput}/>
        <TouchableOpacity onPress={this.handleSave.bind(this)} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        {/*}<TouchableOpacity onPress={this.handleSync.bind(this)} style={styles.button}>
            <Text style={styles.buttonText}>Sync</Text>
        </TouchableOpacity>*/}
        <ScrollView >
          <Text>ddd</Text>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderItem}
            style={styles.listView}/>
        </ScrollView>
      </View>
    );
  }
}

export default Home;
