export default function api() {
  localDBUrl: 'http://localhost:5984/',
  localDBName: 'todo_app',
  remoteDBUrl: 'http://localhost:4984/',
  remoteDBName: 'db',

  saveTodos(title) {
    return fetch(this.localDBUrl + this.localDBName, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'list',
          title: title,
        })
      }).then(res => res.json());
  },

  getTodos() {
    return fetch(this.localDBUrl + this.localDBName + '/_all_docs?include_docs=true')
      .then(res => {
        console.log('save',res);
        if (res.status !== 200) {
          return fetch(this.localDBUrl + this.localDBName, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ok: true})
            }).then( res => res.json());
        }
        return res.json();
      });
  },
}
