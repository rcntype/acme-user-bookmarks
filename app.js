const {Component} = React
const {render} = ReactDOM
const {HashRouter, Route, Link, Switch, Redirect} = ReactRouterDOM

const API = 'https://acme-users-api-rev.herokuapp.com/api';


const fetchUser = async ()=> {
    const storage = window.localStorage;
    const userId = storage.getItem('userId'); 
    if(userId){
    try {
        return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
        storage.removeItem('userId');
        return fetchUser();
    }
    }
    const user = (await axios.get(`${API}/users/random`)).data;
    storage.setItem('userId', user.id);
    return  user;
};




const Nav = ({path, bookmarks}) => {
    let categories = []
    return (
        <nav>{
            bookmarks.map(bm => {
                if (!categories.includes(bm.category)) {
                    categories.push(bm.category)
                    console.log(categories)
                    return (
                        <Link to={bm.category} key={bm.category}>{bm.category}</Link>
                    )

                }
                
            })
        }</nav>
    )
}

const BookmarkURLs = ({bookmarks}) => {
    return (
        <ul>{
            bookmarks.map(eachMark => {
                return (
                    <li key={eachMark.id}>{eachMark.url}<span>Destroy</span></li>
                )
            })        
        }</ul>
    )
}

class Form extends Component {
    constructor() {
        super()
        this.state = {
            category: '',
            url: ''
        }
        this.create = this.create.bind(this)
    }
    create() {
        const {category, url} = this.state
        this.props.create({category, url})

    }
    render() {
        const {url, category, bookmarks} = this.state
        return (
            <div>
                <form onSubmit={(ev)=> ev.preventDefault()}>
                    <input value={url} placeholder='url' onChange={(ev)=> this.setState({url: ev.target.value})}/>
                    <input value={category} placeholder='category' onChange={(ev)=> this.setState({category: ev.target.value})}/>
                    <button onClick={this.create}>Create</button>
                </form>
                {/* <BookmarkURLs bookmarks={bookmarks}/> */}
            </div>
        )
    }
}



class App extends Component {
    constructor() {
        super()
        this.state = {
            user: {},
            bookmarks: []
        }
        this.destroy = this.destroy.bind(this)
        this.create = this.create.bind(this)
        this.update = this.update.bind(this)
    }
    
    async create(bookmark) {
        const newBookmark = await axios.post(`${API}/users/${this.state.user.id}/bookmarks`, bookmark);
        const bookmarks = [...this.state.bookmarks, newBookmark]
        this.setState({bookmarks});
    }

    async componentDidMount() {
        const user = await fetchUser()
        const bookmarks = (await axios.get(`${API}/users/${user.id}/bookmarks`)).data
        this.setState({user, bookmarks})
    }

    async update(){
        const updated = (await axios.put(`${API}/users/${this.state.user.id}/bookmarks/${bookmarks.id}`, { category: '', url: ''})).data;
        this.setState({ bookmarks : this.state.bookmarks.map( bm => bm.id === updated.id ? updated : bm)});
      }

    async destroy(bookmarks) {
        await axios.delete(`${API}/users/${this.state.user.id}/bookmarks/${bookmarks.id}`);
        this.setState({ bookmarks : this.state.bookmarks.filter( _bm => _bm.id !== bookmarks.id)});
    }

    render() {
        const {user, bookmarks} = this.state
        const {destroy, create, update} = this
        console.log('App state', this.state)
        return (
            <HashRouter>
                <h2> {user.fullName} ({bookmarks.length} Bookmarks)</h2>
                <Route render={(location) => <Nav path={location.pathname} bookmarks={bookmarks}/>}/>
                <Route render={()=> <Form create={create} update={update} bookmarks={bookmarks}/>}/>
                <Switch>
                    <Route path={bookmarks.category} render={()=> <BookmarkURLs bookmarks={bookmarks}/>}/>
                        
                    



                </Switch>
            </HashRouter>

            
        )
    }
}




const root = document.querySelector('#root');
ReactDOM.render(<App/>, root);