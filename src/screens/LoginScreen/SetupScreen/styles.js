import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 25,
    color: '#2a3b52',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  btnContainer: {
    width,
    alignItems: 'center',
    marginTop: 20,
  },

  btn: {
    width: width - 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  btnText: {
    color: '#2a3b52',
    fontSize: 22,
    fontWeight: '600',
  },
});

export default styles;
