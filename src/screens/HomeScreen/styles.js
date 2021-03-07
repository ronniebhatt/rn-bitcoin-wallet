import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    height: height * 0.55,
    zIndex: 100,
  },
  bottomContainer: {
    height: height * 0.45,
  },
  btnContainer: {
    width,
    position: 'relative',
    bottom: 0,
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
    fontSize: 22,
    fontWeight: '600',
  },
  btnAddressText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 20,
  },
  transactionText: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 15,
    textTransform: 'uppercase',
  },
  emptyTransactionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
});

export default styles;
