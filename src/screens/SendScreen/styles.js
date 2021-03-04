import {StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textInputContainer: {
    width: width - 40,
    alignSelf: 'center',
  },
  textInputOuterContainer: {
    borderWidth: 1,
    height: 50,
    marginVertical: 20,
    paddingLeft: 20,
    borderRadius: 10,
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
  },
  btnContainer: {
    backgroundColor: '#265C7E',
    width: width - 40,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  btnOuterContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    backgroundColor: '#265C7E',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMsgContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
  },
});
export default styles;
