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
    borderWidth: 0.5,
    width: '100%',
    marginVertical: 10,
    height: 120,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 20,
    borderColor: 'rgba(0,0,0,0.7)',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 20,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  btn: {
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 10,
    marginHorizontal: 10,
    backgroundColor: '#265C7E',
    marginTop: '50%',
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  generateAddressBtn: {
    backgroundColor: 'rgb(251,87,7)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 20,
  },
  generateAddressText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default styles;
