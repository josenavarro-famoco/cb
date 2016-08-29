import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
} from 'react-native';

import {manager, ReactCBLite} from 'react-native-couchbase-lite';

const localDBName = 'cbdb';

class Movies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      sequence: '',
      filteredMovies: 0
    }
  }

  componentDidMount() {
    ReactCBLite.init((url) => {
      // instantiate a new database
      var database = new manager(url, localDBName);
      database.createDatabase()
        .then((res) => {
          database.createDesignDocument('main', {
            'filters': {
              'year': 'function (doc) { if (doc.year === 2004) {return true;} return false;}'
            },
            'views': {
              'movies': {
                'map': 'function (doc) {if (doc.year) {emit(doc._id, null);}}'
              }
            }
          });
          database.replicate('http://10.111.4.12:4984/db', localDBName);
          database.getInfo()
            .then((res) => {
              database.listen({since: res.update_seq - 1, feed: 'longpoll'});
              database.changesEventEmitter.on('changes', function (e) {
                console.log('changes',e)
                this.setState({sequence: e.last_seq});
              }.bind(this));
            });
        })
        .then((res) => {
          return database.queryView('main', 'movies', {include_docs: true});
        })
        .then((res) => {
          console.log('data',res.rows);
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(res.rows.slice(0,5))
          });
        })
        .catch((ex) => {
          console.log(ex)
        });

    });
  }

  renderMovie(data) {
    const movie = data.doc;
    console.log(movie.posters)
    return (
      <View style={styles.container}>
        <Image
          source={{uri: movie.posters && movie.posters.thumbnail ? movie.posters.thumbnail : 'XXX'}}
          style={styles.thumbnail}/>
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{movie.title ? movie.title : 'mis' }</Text>
          <Text style={styles.year}>{movie.year ? movie.year : 'tye' }</Text>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View>
        <Text style={styles.seqTextLabel}>
          The database sequence: {this.state.sequence}
        </Text>
        <Text>
          Movies published in 2004: {this.state.filteredMovies}
        </Text>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderMovie}
          style={styles.listView}/>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  listView: {
    backgroundColor: '#F5FCFF',
  },
  seqTextLabel: {
    textAlign: 'center',
    margin: 5
  }
});

export default Movies;
