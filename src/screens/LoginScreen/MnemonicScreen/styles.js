import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: width - 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  textInput: {
    width: '100%',
    marginVertical: 20,
    height: 150,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 20,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
});

export default styles;
