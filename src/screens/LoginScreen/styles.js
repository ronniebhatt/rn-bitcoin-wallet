import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
  },

  btnContainer: {
    width,
    alignItems: 'center',
    marginTop: 20,
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  textInputOuterContainer: {
    width: width - 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  textInput: {
    borderWidth: 1,
    width: '30%',
    marginVertical: 10,
    height: 40,
    borderRadius: 5,
    paddingLeft: 10,
  },
});

export default styles;
