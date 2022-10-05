import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MaterialFixedLabelTextbox from "../components/MaterialFixedLabelTextbox";
import MaterialUnderlineTextbox1 from "../components/MaterialUnderlineTextbox1";
import MaterialButtonPrimary1 from "../components/MaterialButtonPrimary1";

function CreateAccount(props) {
  return (
    <View style={styles.container}>
      <View style={styles.rect}>
        <View style={styles.group}>
          <MaterialFixedLabelTextbox
            style={styles.materialFixedLabelTextbox}
          ></MaterialFixedLabelTextbox>
          <MaterialFixedLabelTextbox
            style={styles.materialFixedLabelTextbox1}
          ></MaterialFixedLabelTextbox>
          <MaterialUnderlineTextbox1
            style={styles.materialUnderlineTextbox1}
          ></MaterialUnderlineTextbox1>
          <MaterialButtonPrimary1
            style={styles.materialButtonPrimary1}
          ></MaterialButtonPrimary1>
        </View>
        <View style={styles.rect}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(69,67,67,1)"
  },
  rect: {
    width: 332,
    height: 20,
    backgroundColor: "#E6E6E6",
    marginTop: 291,
    marginLeft: 5
  },
  group: {
    width: 337,
    height: 297
  },
  materialFixedLabelTextbox: {
    height: 43,
    width: 337
  },
  materialFixedLabelTextbox1: {
    height: 43,
    width: 337,
    marginTop: 36
  },
  materialUnderlineTextbox1: {
    height: 43,
    width: 335,
    marginTop: 37,
    marginLeft: 2
  },
  materialButtonPrimary1: {
    height: 36,
    width: 335,
    marginTop: 59
  }
});

export default CreateAccount;
