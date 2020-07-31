import React, { Component } from "react";
import {Text, View, ScrollView, Picker, StyleSheet, Switch, Button, Alert} from "react-native";
import * as Animatable from "react-native-animatable";
import DatePicker from "react-native-datepicker";
import { Permissions, Notifications } from 'expo';

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guests: 1,
      smoking: false,
      date: "",
      showModal: false
    };
  }

  static navigationOptions = {
    title: "Reserve Table"
  };

 async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(
      Permissions.USER_FACING_NOTIFICATIONS
    );
    if (permission.status !== "granted") {
      permission = Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
      if (permission.status !== "granted") {
        Alert.alert("Permmision not granted to show notifiactions");
      }
    }
    return permission;
  }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
      title: "your Reservatiion",
      body: `Reservation for ${date.toString()} has been requested`,
      ios: {
        sound: true
      },
      android: {
        sound: true,
        vibrate: true,
        color: "#512"
      }
    });
  }

  async obtainCalendarPermission() {
    let permission = await Permissions.getAsync(Permissions.CALENDAR);
    if (permission.status !== "granted") {
      permission = Permissions.askAsync(Permissions.CALENDAR);
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted for calendar");
      }
    }
  }

  addReservationToCalendar = async date => {
    await this.obtainCalendarPermission();
    Calendar.createEventAsync(Calendar.DEFAULT, {
      title: "Con Fusion table Reservation",
      allDay: false,
      location: "121, Clear Water Bay Road Kowloon, HONG KONG",
      startDate: new Date(date),
      endDate: new Date(new Date(date).getTime() + 3600000 * 2),
      timeZone: "Asia/Kolkata"
    })
      .then(() => {
        console.log("Successfully created event");
      })
      .catch(err => console.log("Can not create event", err));
  };

  handleReservation = () => {
    console.log(this.state);
    this.toggleModal();
    Alert.alert(
      "Your Reservation OK?",
      `No. of Guests: ${this.state.guests}\nSmoking? ${
        this.state.smoking ? "true" : "false"
      }\nDate And Time: ${this.state.date}`,
      [
        {
          text: "Cancel",
          onPress: () => this.resetForm(),
          style: "cancel"
        },
        {
          text: "Ok",
          onPress: () => {
            this.presentLocalNotification(this.state.date);
            this.addReservationToCalendar(this.state.date);
            this.resetForm();
          }
        }
      ],
      { cancelable: false }
    );
  };

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  resetForm = () => {
    this.setState({
      guests: 1,
      smoking: false,
      date: ""
    });
  };

  render() {
    return (
      <ScrollView>
        <Animatable.View animation="zoomInUp" duration={2000}>
          <View style={styles.formRow}>
            <Text style={styles.formLabeL}>Number of Guests</Text>
            <Picker
              style={styles.formItem}
              selectedValue={this.state.guests}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ guests: itemValue })
              }
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabeL}>Smoking/Non-Smoking?</Text>
            <Switch
              style={styles.formItem}
              value={this.state.smoking}
              trackColor="#512"
              onValueChange={value => this.setState({ smoking: value })}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabeL}>Date</Text>
            <DatePicker
              style={{ flex: 1, marginRight: 20 }}
              date={this.state.date}
              format=""
              mode="datetime"
              placeholder="Select Date Time"
              minDate="2019-04-28"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={date => this.setState({ date })}
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
              }}
            />
          </View>
          <View style={styles.formRow}>
            <Button
              title="Reserve"
              color="#512"
              accessibilityLabel="Learn more about this label"
              onPress={this.handleReservation}
            />
          </View>
        </Animatable.View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  formLabeL: {
    flex: 2,
    fontSize: 18
  },
  formItem: {
    flex: 1
  },
  modal: {
    justifyContent: "center",
    margin: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512",
    textAlign: "center",
    color: "white",
    marginBottom: 20
  },
  modalText: {
    fontSize: 18,
    margin: 10
  }
});

export default Reservation;