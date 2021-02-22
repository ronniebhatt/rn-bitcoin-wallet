import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    height: height * 0.47,
  },
  bottomContainer: {
    height: height * 0.53,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    backgroundColor: '#265C7E',
  },
  btnContainer: {
    width,
    position: 'absolute',
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
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
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
  },
  balanceText: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '600',
  },
  btnAddressText: {
    textAlign: 'center',
    fontSize: 14,
    paddingTop: 20,
  },
  transactionText: {
    textAlign: 'center',
    fontSize: 22,
    paddingVertical: 10,
    color: '#fff',
  },
  emptyTransactionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
});

export default styles;
