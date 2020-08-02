import React, {Component} from 'react';
import {Text, View, ScrollView, StyleSheet, Picker, Switch, 
    Button, TouchableOpacity, Modal, Alert, Platform} from 'react-native';
import {Icon} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { Notifications} from 'expo';
import * as Permissions from 'expo-permissions';
import * as Calendar from 'expo-calendar';

class Reservation extends Component{

    constructor(props) {
        super(props);
        this.state = {
            guests:1,
            smoking: false,
            date: new Date().toDateString(),
            show: false,
            mode: "date",
            showModal: false
        }
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal})
    }

    handleReservation() {
        console.log(JSON.stringify(this.state));
        Alert.alert(
            'Your Reservation OK?',
            'Number of Guests: ' + this.state.guests + '\nSmoking?  ' + this.state.smoking + '\nDate and Time: ' + this.state.date,
            [
                { text: 'Cancel', onPress: () => this.resetForm(), style: 'cancel' },
                {
                    text: 'OK', onPress: () => {
                        this.presentLocalNotification(this.state.date);
                        this.addReservationToCalendar(this.state.date);
                        this.resetForm();
                    }
                },
            ],
            { cancelable: false }
        );
    }

    resetForm() {
        this.setState({
            guests:1,
            smoking: false,
            date: new Date().toISOString().split('T')[0],
            show: false,
            mode: "date",
        });
    }

    async obtainCalendarPermission() {
        let permission = await Permissions.getAsync(Permissions.CALENDAR);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.CALENDAR);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to calendar');
            }
        }
        return permission;
    }

    async addReservationToCalendar(date) {
        await this.obtainCalendarPermission();

        let dateMs = Date.parse(date);
        let startTime = new Date(dateMs);
        let endTime = new Date(dateMs + 2 * 60 * 60 * 1000);

        await Calendar.createEventAsync(defaultCalendarSource, {
            title: 'Con Fusion Table Reservation',
            startTime: startTime,
            endTime: endTime,
            timeZone: 'Asia/Hong_Kong',
            location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
        });
    }

    async obtainNotificationPermission(){
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if ( permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if(permission.status !== 'granted') {
                Alert.alert('Permission not granted to show notification')
            }
        }
        return permission;
    }

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission();
        Notifications.presentLocalNotificationAsync({
            title: 'Your Reservation',
            body: 'Reservation for ' + date + ' requested',
            ios: {
                sound: true
            },
            android: {
                channelId: 'reservation',
                color: '#512DA8'
            }
        })

        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('reservation', {            
            name: 'Confusion',            
            sound: true,            
            vibrate: [0, 250, 250, 250],            
            priority: 'max',            
            });            
        }
    }

    render() {
        return(
            <ScrollView>
                <Animatable.View animation="zoomIn" duration={2000}>
                <View style= {styles.formRow}>
                    <Text style= {styles.formLabel}>
                        Number of Guests
                    </Text>
                    <Picker
                        style= {styles.formItem}
                        selectedValue= {this.state.guests}
                        onValueChange= {(itemValue, itemIndex) =>this.setState({ guests: itemValue})}
                        >
                            <Picker.Item label = '1' value= '1'/>
                            <Picker.Item label = '2' value= '2'/>
                            <Picker.Item label = '3' value= '3'/>
                            <Picker.Item label = '4' value= '4'/>
                            <Picker.Item label = '5' value= '5'/>
                            <Picker.Item label = '6' value= '6'/>
                    </Picker>
                </View>
                <View style= {styles.formRow}>
                    <Text style= {styles.formLabel}>
                        Smoking/Non-Smoking?
                    </Text>
                    <Switch 
                       style= {styles.formItem}
                       value= {this.state.smoking}
                       onTintColor= '#512DA8'
                       onValueChange= {(value) => this.setState({ smoking: value})} 
                       >
                    </Switch>
                </View>

                <View style={styles.formRow}>
                    <Text style={styles.formLabel}>
                        Date and Time
                    </Text>
                    <TouchableOpacity style={styles.formItem}
                        style={{
                            padding: 7,
                            borderColor: '#512DA8',
                            borderWidth: 2,
                            flexDirection: "row"
                        }}
                        onPress={() => this.setState({ show: true, mode: 'date' })}
                        >
                        <Icon type='font-awesome' name='calendar' color='#512DA8' />
                        <Text >
                             {this.state.date}
                        </Text>
                    </TouchableOpacity>
                    {/* Date Time Picker */}
                    {this.state.show && 
                        <DateTimePicker
                            value={this.state.date}
                            mode={this.state.mode}
                            minimumDate={this.state.date}
                            minuteInterval={30}
                            onChange={(event, date) => {
                                if (date === undefined) {
                                    this.setState({ show: false });
                                }
                                else {
                                    this.setState({ 
                                        show: this.state.mode === "time" ? false : true,
                                        mode: "time",
                                        date: new Date(date).toISOString().split('T')[0]
                                    });
                                }
                            }
                        }
                        />
                    }
                </View>
                
                <View style= {styles.formRow}>
                    <Button 
                        title= 'Reserve'
                        color= '#512DA8'
                        onPress= {() => this.handleReservation()}
                        accessibilityLabel= 'Learn more about this purple button'
                        />
                </View>
                <Modal
                    animationType = {'slide'}
                    transparent= {false}
                    visible= {this.state.showModal}
                    onDismiss= {() => {this.toggleModal(); this.resetForm()}}
                    onRequestClose= {()=> {this.toggleModal(); this.resetForm()}}
                    >
                    <View style= {styles.Modal}>
                        <Text style={styles.modalTitle}>
                            Your Reservation
                        </Text>
                        <Text style = {styles.modalText}>
                            Number of Guests: {this.state.guests}
                        </Text>
                        <Text style = {styles.modalText}>
                            Smoking? : {this.state.smoking}
                        </Text>
                        <Text style = {styles.modalText}>
                            Date and Time: {this.state.date}
                        </Text>
                        <Button 
                            onPress={()=> {this.toggleModal(); this.resetForm()}}
                            color='#512DA8'
                            title='Close'
                            />
                    </View>
                </Modal>
            </Animatable.View>
            </ScrollView>
        );
    }
}

const styles= StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex:2,
    },
    formItem : {
        flex:1
    },
    modal : {
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
    modalText: {
        fontSize: 18,
        margin: 10
    }
})

export default Reservation;