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
    marginTop: 40,
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
    paddingLeft: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backupWordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  backupWordIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
  },

  mnemonicWordContainer: {
    width: 100,
    marginHorizontal: 5,
    paddingVertical: 5,
    flexDirection: 'row',
  },
});

export default styles;
