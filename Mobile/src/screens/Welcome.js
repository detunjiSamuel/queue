import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MaterialButtonPrimary from "../components/MaterialButtonPrimary";
import MaterialButtonPink from "../components/MaterialButtonPink";
import MaterialHeader4 from "../components/MaterialHeader4";

function Welcome(props) {
  return (
    <View style={styles.container}>
      <View style={styles.groupRow}>
        <View style={styles.group}>
          <View style={styles.rect}></View>
          <View style={styles.rect2}></View>
          <MaterialButtonPrimary
            style={styles.materialButtonPrimary}
          ></MaterialButtonPrimary>
          <MaterialButtonPink
            style={styles.materialButtonPink1}
          ></MaterialButtonPink>
        </View>
        <MaterialHeader4 style={styles.materialHeader4}></MaterialHeader4>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(69,67,67,1)",
    flexDirection: "row"
  },
  group: {
    width: 319,
    height: 641,
    marginTop: 40
  },
  rect: {
    width: 319,
    height: 85,
    backgroundColor: "#E6E6E6"
  },
  rect2: {
    width: 305,
    height: 259,
    backgroundColor: "#E6E6E6",
    marginTop: 79,
    marginLeft: 11
  },
  materialButtonPrimary: {
    height: 39,
    width: 312,
    marginTop: 119,
    marginLeft: 3
  },
  materialButtonPink1: {
    height: 42,
    width: 312,
    marginTop: 18,
    marginLeft: 3
  },
  materialHeader4: {
    height: 56,
    width: 375,
    marginLeft: 75
  },
  groupRow: {
    height: 681,
    flexDirection: "row",
    flex: 1,
    marginRight: -422,
    marginLeft: 28,
    marginTop: 50
  }
});

export default Welcome;
