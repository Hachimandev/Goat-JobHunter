import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const chat = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchText}>🔍 Tìm kiếm</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  searchBar: {
    padding: 12,
    backgroundColor: "#0084FF",
  },
  searchText: {
    color: "#fff",
  },
});

export default chat;
