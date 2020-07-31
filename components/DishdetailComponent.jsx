import React , {Component} from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import  {Card, Icon, Rating, Input} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {connect} from 'react-redux';
import {baseUrl} from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return{
        dishes: state.dishes,
        comments : state.comments,
        favorites: state.favorites
    }
}
const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment : (commentId, dishId, rating, comment, author) => dispatch(postComment(commentId, dishId, rating, comment, author))
});

function RenderDish (props){
    const dish = props.dish;

    const handleViewRef = ref => this.view = ref;
   
    const recognizeDrag = ({moveX, moveY, dx, dy}) => {
        if(dx < -200){
            return true;
        }
        else {
            return false;
        }
    };

    const recognizeComment = ({moveX, moveY, dx, dy}) => {
        if(dx > 200){
            props.toggleModal();
        }
         return true;
    };
    
    const shareDish = (title, message, url) => {
      Share.share({
          title: title,
          message: title + ': ' + message + ' ' + url,
          url: url
      },{
          dialogTitle: 'Share ' + title
      })
  }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder : (e, gestureState) => {
            return true;
        },
        onPanResponderGrant : () => {this.view.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanRespnderEnd : (e, gestureState) => {
            if(recognizeDrag(gestureState)){
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you want to add '+dish.name + 'to your Favorite?',
                    [
                        {
                            text : 'Cancel',
                            onPress : () => console.log('Cancel pressed'),
                            style : 'cancel'
                        },
                        {
                            text : 'OK',
                            onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()} 
                        }
                    ],
                    {cancelable: false}
                );
                return true;
            }
            if(recognizeComment(gestureState)){
                 <Modal
                    animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <View style = {styles.modal}>
                        <Text style = {styles.modalTitle}>Feedback</Text>
                    </View>
                    <View >
                        <Rating
                            name='rating'
                            type='star'
                            showRating
                            ratingColor='#3498db'
                            onFinishRating={this.ratingCompleted}
                            style={{ paddingVertical: 10 }}
                        />
                    </View>
                    <View style={styles.formLabel}>
                        <Input
                            placeholder= 'Author'
                            leftIcon={
                                <Icon
                                    name='user'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                />   
                           }
                           onChange={({ nativeEvent }) => this.setState({author: nativeEvent.text})}
                        />
                    </View>
                    <View style={styles.formLabel}>
                        <Input 
                            placeholder= 'Comment'
                            leftIcon={
                                <Icon
                                    name='comment'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                />
                            }
                            onChange={({ nativeEvent }) => this.setState({comment: nativeEvent.text})}
                        />
                    </View>
                    <View style={styles.formLabel}>
                    <Button
                        onPress={() => {this.handleComment(dishId, this.props.comments.comments.length);this.resetForm();}}
                        title="SUBMIT"
                        color="#512DA8"
                        />
                </View>
                <View style={styles.formLabel}>
                    <Button
                        onPress={() => {this.resetForm();}}
                        title="CANCEL"
                        color="#a9a9a9"
                        />
                </View>
           </Modal>

            }
        }
    });
    if(dish!=null){
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000} {...panResponder.panHandlers}>
                <Card
                    featuredTitle={dish.name}
                    image={{uri:baseUrl+dish.image}}>
                    <Text style={{margin:10}}>
                        {dish.description}
                    </Text>
                    <Icon style={styles.cardItem}
                        raised
                        reverse
                        name={props.favorite?'heart':'heart-o'}
                        type="font-awesome"
                        color='#f50'
                        onPress={()=> props.favorite?console.log('Already favorite!'):props.onPress()}
                    />
                    <Icon  style={styles.cardItem}
                        raised
                        name='pencil'
                        type='font-awesome'
                        color=' #512DA8'
                        onPress={() => props.toggleModal()}
                    />
                    <Icon
                        raised
                        reverse
                        name='share'
                        type='font-awesome'
                        color='#51D2A8'
                        style={styles.cardItem}
                        onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} 
                    />
                </Card>
            </Animatable.View>
        );
    }
    else{
        return(
            <View></View>
        );  
    }
}

function RenderComments(props){

    const comments = props.comments;

    const renderCommentItem = ({item , index}) => {
        return(
            <View key={index} style={{margin:10}}>
                <Text style={{fontSize:14}}>{item.comment}</Text>
                <Text style={{fontSize:12}}>{item.rating}</Text>
                <Text style={{fontSize:12}}>{'--'+item.author+', '+item.date}</Text>
            </View>
        );
    }
    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item=>item.id.toString()}/>
            </Card>
        </Animatable.View>
    );

}
class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal:false,
            rating:1,
            author:'',
            comment:''
        };
    }
    markFavorite(dishId){
        this.props.postFavorite(dishId);
    }
    static navigationOptions = {
        title: 'Dish Details'
    }
    handleComment(dishId, commentId){
        console.log("Comment is: " + commentId, dishId, this.state.rating, this.state.comment, this.state.author)
        this.props.postComment(commentId, dishId, this.state.rating, this.state.comment, this.state.author);
    }
    resetForm() {
        this.setState({
            rating: 1,
            author: '',
            comments: ''
        });
    }
    toggleModal(){
        this.setState({showModal:!this.state.showModal})
    }
    ratingCompleted=(rating) => {
        console.log("Rating is: " + rating);
        this.setState({rating:rating})
        
    }
    render(){
        const dishId = this.props.route.params.dishId;
        return(
          <ScrollView>
            <RenderDish dish={this.props.dishes.dishes[+dishId]}
                favorite={this.props.favorites.some(el=> el===dishId)}
                onPress={()=> this.markFavorite(dishId)}
                toggleModal={() => this.toggleModal()}/>
            <RenderComments comments={this.props.comments.comments.filter((comment)=> comment.dishId===dishId)}/>
            <Modal
                    animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <View style = {styles.modal}>
                        <Text style = {styles.modalTitle}>Feedback</Text>
                    </View>
                    <View >
                        <Rating
                            name='rating'
                            type='star'
                            showRating
                            ratingColor='#3498db'
                            onFinishRating={this.ratingCompleted}
                            style={{ paddingVertical: 10 }}
                        />
                    </View>
                    <View style={styles.formLabel}>
                        <Input
                            placeholder= 'Author'
                            leftIcon={
                                <Icon
                                    name='user'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                />   
                           }
                           onChange={({ nativeEvent }) => this.setState({author: nativeEvent.text})}
                        />
                    </View>
                    <View style={styles.formLabel}>
                        <Input 
                            placeholder= 'Comment'
                            leftIcon={
                                <Icon
                                    name='comment'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                />
                            }
                            onChange={({ nativeEvent }) => this.setState({comment: nativeEvent.text})}
                        />
                    </View>
                    <View style={styles.formLabel}>
                    <Button
                        onPress={() => {this.handleComment(dishId, this.props.comments.comments.length);this.resetForm();{showModal:!this.state.showModal};}}
                        title="SUBMIT"
                        color="#512DA8"
                        />
                </View>
                <View style={styles.formLabel}>
                    <Button
                        onPress={() => {this.resetForm();{showModal:!this.state.showModal};}}
                        title="CANCEL"
                        color="#a9a9a9"
                        />
                </View>
           </Modal>
        </ScrollView>
       );
    }  
}
const styles = StyleSheet.create({
    iconAlignment : {
            alignItems:'center',
            justifyContent:'center',
            margin:20
    },
     modal: {
            justifyContent: 'center',
            margin: 20
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            backgroundColor: '#512DA8',
            textAlign: 'center',
            color: 'white',
            marginBottom: 20
        },
        formLabel: {
            fontSize:18,
            padding:5
        }

});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);