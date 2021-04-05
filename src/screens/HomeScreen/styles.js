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
    width: width - 80,
    position: 'relative',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 15,
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
    textAlign: 'left',
    fontSize: 22,
    fontWeight: '600',
    padding: 20,
    textTransform: 'uppercase',
  },
  btnAddressText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 20,
  },
  transactionText: {
    textAlign: 'left',
    fontSize: 18,
    paddingHorizontal: 15,
    textTransform: 'capitalize',
  },
  emptyTransactionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 15,
  },
  headerText: {
    fontSize: 22,
    color: '#000',
    paddingLeft: 30,
  },

  bitcoinBalanceCard: {
    width: width - 40,
    alignSelf: 'center',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#f0b641',
    marginTop: 20,
  },
  bottomTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    bottom: 0,
  },

  bottomText: {
    fontSize: 22,
    color: '#000',
    paddingLeft: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    width: width - 60,
    alignSelf: 'center',
    marginBottom: 4,
    marginVertical: 15,
    borderBottomWidth: 0.8,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  tabs: {
    width: '33%',
    textAlign: 'center',
    paddingBottom: 5,
    // borderBottomWidth: 2,
  },
  tabsText: {
    textAlign: 'center',
  },
});

export default styles;
