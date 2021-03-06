/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
  TextInput,
  ImageBackground,
  Alert,
} from 'react-native';
import normalize from 'react-native-normalize';
import { RFPercentage } from 'react-native-responsive-fontsize';

import EntypoIcon from 'react-native-vector-icons/Entypo';
EntypoIcon.loadFont();

import LinearGradient from 'react-native-linear-gradient';
import AppIntroSlider from 'react-native-app-intro-slider';
import Spinner from 'react-native-loading-spinner-overlay';

import { getDistance, getPreciseDistance } from 'geolib';

import { Colors, Images, Constants } from '@constants';
import ServiceItem from '../../components/BusinessServiceItem';
import ReviewModal from '../../components/ReviewModal';
import AppHeader from '../../components/AppHeader/AppHeader';
import { setData, checkInternet } from '../../service/firebase';

export default function BusinessServicesScreen({ navigation }) {
  const [businessItem, setBusinessItem] = useState();
  const [services, setServices] = useState();
  const [refresh, setRefresh] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (Constants.user.bid) {
      let business = Constants.business.find(item => item.id === Constants.user.bid);
      let servs = Constants.services.filter(each => each.bid === business.id);
      setBusinessItem(business);
      setServices(servs);
    }
  },[]);

  const onRefresh = () => {
    if (Constants.user.bid)
    {
      let servs = Constants.services.filter(each => each.bid === Constants.user.bid);
      setServices(servs);
    }
  }

  const onAdd = () => {
    navigation.navigate('ServiceEdit', {onRefresh: onRefresh});
  }

  const onEdit = (item) => {
    navigation.navigate('ServiceEdit', { serviceItem: item , onRefresh: onRefresh});
  }

  const onDelete = (item) => {
    Alert.alert(
      'Are you sure want to delete this service?',
      '',
      [
        {
          text: "OK", onPress: async () => {
            setData('services', 'delete', item)
            .then(()=>{
              Constants.services.splice(services.findIndex(each => each.id === item.id), 1);
              onRefresh();
            })
            .catch((err)=>{
              console.log('On deleting service, error:', err);
            });
          }
        },
        { text: "CANCEL", onPress: () => { } }
      ],
    );
  }

  const onServiceItem = (item) => {
    navigation.navigate('BusinessServiceDetail', { serviceItem: item });
  }

  const toggleReviewModal = () => {
    setReviewModal(!reviewModal);
  }

  const confirmReviewBusiness = async (rating, review) => {
    setReviewModal(!reviewModal);
    setSpinner(true);

    var isConnected = await checkInternet();
    if (!isConnected) {
      Alert.alert('Please check your internet connection.');
      setSpinner(false);
      return;
    }

    //check already, update or add
    var index = Constants.reviews.findIndex(each => each.uid === Constants.user?.id && each.bid === businessItem.id);
    var reviewItem = Constants.reviews.find(each => each.uid === Constants.user?.id && each.bid === businessItem.id);
    var action = '';
    var newItem = '';

    if (index === -1) {
      action = 'add';
      newItem = {
        uid: Constants.user?.id,
        bid: businessItem.id,
        bRating: rating,
        bDesc: review,
        type: 'business',
        status: 'ready'
      }
    }
    else {
      action = 'update';
      newItem = {
        ...reviewItem,
        bRating: rating,
        bDesc: review,
        status: 'ready'
      }
    }

    setData('reviews', action, newItem)
      .then(() => {
        console.log('review success');
        Alert.alert(
          "Sent Successfully!",
          "After acceptance, this review will be published",
          [
            { text: "OK", onPress: () => { setSpinner(false); } }
          ],
        );
      })
      .catch((err) => {
        console.log('review error:', err);
        Alert.alert(
          "Some Error!",
          "",
          [
            { text: "OK", onPress: () => { setSpinner(false); } }
          ],
        );
      })
  }

  const getDistanceMile = (businessItem) => {
    let myLocation = (Constants.location.latitude && Constants.location.longitude) ? 
        Constants.location : Constants.user?.location;

    if (!businessItem)
      return 0;

    if ((!myLocation?.latitude || !myLocation?.longitude) ||
      (!businessItem.location?.latitude || !businessItem.location?.longitude)) {
      return 0;
    }
    else {
      if (!myLocation) return 0;
      var distance = getDistance(myLocation, businessItem.location);
      var distanceMile = distance / 1000 / 1.6;
      return distanceMile.toFixed(2);
    }
  }

  function showAlert() {
    Alert.alert('You should login first!', 'Going to login now?',
      [
        {
          text: 'OK', onPress: () => navigation.navigate('Auth')
        },
        {
          text: 'CANCEL', onPress: () => { }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={spinner}
        textContent={''}
      />
      <View style={styles.header}>
        {/* <View style={styles.iconBackContainer}>
          <TouchableOpacity onPress={() => {
            Constants.refreshFlag = true;
            if (Constants.backRoute == 'Profile') navigation.navigate('Profile');
            else navigation.goBack(null);
          }}>
            <EntypoIcon name="chevron-thin-left" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleTxt} numberOfLines={1} ellipsizeMode='tail'>{businessItem.name}</Text>
        </View>
        <View style={styles.iconFlagContainer}>
          {// <TouchableOpacity onPress={() => onBookmarkBusiness(Constants.user.favorbids.includes(businessItem.id) ? 'delete' : 'add')}>
           // <EntypoIcon name="bookmark" style={[styles.headerIconBookmark, Constants.user.favorbids.includes(businessItem.id) ? { color: Colors.yellowToneColor } : null]}></EntypoIcon>
          //</TouchableOpacity>
          }
          <TouchableOpacity onPress={() => {
            if (Constants.user) {
              setReviewModal(!reviewModal)
            }
            else {
              showAlert();
            }
          }}>
            <EntypoIcon name="flag" style={styles.headerIcon}></EntypoIcon>
          </TouchableOpacity>
        </View> */}
        <AppHeader
              title={'Business Services'}
              leftIconPath={Images.headerLeftBack}
              rightIconOnePath={Images.ic_add}
              onLeftIconPress={() => {
                Constants.refreshFlag = true;
                if (Constants.backRoute === 'Profile') navigation.navigate('Profile');
                else navigation.goBack(null);
              }}
              onRightIconPress={() => {
                onAdd();
              }}
          />
      </View>

      {/* <View style={styles.topImgLine}>
        <AppIntroSlider
          keyExtractor={(item, index) => index.toString()}
          data={businessItem?.slideImgs?.length > 0 ? businessItem?.slideImgs : [businessItem?.img]}
          showNextButton={false}
          showDoneButton={false}
          dotStyle={{ backgroundColor: Colors.whiteColor, marginBottom: normalize(160, 'height') }}
          activeDotStyle={{ backgroundColor: Colors.yellowToneColor, marginBottom: normalize(160, 'height') }}
          renderItem={(data) => {
            return (
              <Image style={styles.img} source={ data.item ? { uri: data.item } : null} resizeMode='stretch' />
            )
          }}
        />
        <LinearGradient style={styles.backGradient} colors={['rgba(0,0,0,0)', 'rgba(20,20,20,1)']}>
          <View style={styles.distanceAddressLine}>
            <View style={styles.distancePart}>
              <EntypoIcon name="map" style={styles.labelIcon}></EntypoIcon>
              <Text style={styles.labelTxt}>{getDistanceMile(businessItem)} mi</Text>
            </View>
            <View style={styles.addressPart}>
              <EntypoIcon name="location-pin" style={styles.labelIcon}></EntypoIcon>
              <Text style={styles.labelTxt}>{businessItem?.address}</Text>
            </View>
          </View>
          {
            businessItem?.site &&
            <View style={styles.urlLine}>
              <EntypoIcon name="network" style={styles.labelIcon}></EntypoIcon>
              <Text style={styles.labelTxt}>{businessItem?.site}</Text>
            </View>
          }
          <View style={styles.phoneHoursLine}>
            <EntypoIcon name="phone" style={styles.labelIcon}></EntypoIcon>
            <Text style={styles.labelTxt}>{businessItem?.phone}</Text>

            <EntypoIcon name="clock" style={styles.labelIcon}></EntypoIcon>
            <Text style={styles.labelTxt}>{businessItem?.operatingHours?.from} - {businessItem?.operatingHours?.to}</Text>
          </View>
        </LinearGradient>
      </View> */}

      <ScrollView style={styles.listBody}>
        {
          services &&
          services.map((each, index) =>
            <ServiceItem key={index} item={each} onPress={onServiceItem} onEdit={onEdit} onDelete={onDelete} showAlert={showAlert} />
          )
        }
        {
          (!services || services?.length === 0) &&
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTxt}>No Services</Text>
          </View>
        }
      </ScrollView>

      {
        reviewModal &&
        <ReviewModal toggleModal={toggleReviewModal} confirmReview={confirmReviewBusiness} />
      }
    </View>
  );
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greyWeakColor
  },
  header: {
    width: '100%',
    height: normalize(60, 'height'),
    flexDirection: 'row',
    backgroundColor: Colors.blackColor
  },
  iconBackContainer: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconFlagContainer: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerIcon: {
    fontSize: RFPercentage(3.5),
    color: Colors.whiteColor,
  },
  headerIconBookmark: {
    fontSize: RFPercentage(3.5),
    color: Colors.whiteColor,
    transform: [{ scaleX: 1.5 }]
  },
  titleTxt: {
    fontSize: RFPercentage(3),
    fontWeight: '600',
    color: Colors.yellowToneColor,
  },

  topImgLine: {
    width: '100%',
    height: '35%'
  },
  img: {
    width: '100%',
    height: '100%'
  },
  backGradient: {
    width: '100%',
    height: normalize(120, 'height'),
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  distanceAddressLine: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: normalize(10, 'height'),
  },
  distancePart: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addressPart: {
    maxWidth: normalize(230),
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: normalize(10),
  },
  labelIcon: {
    fontSize: RFPercentage(2),
    color: Colors.whiteColor,
    marginLeft: normalize(10)
  },
  labelTxt: {
    fontSize: RFPercentage(2),
    color: Colors.greyWeakColor,
    marginLeft: normalize(5)
  },
  urlLine: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(10, 'height')
  },
  phoneHoursLine: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listBody: {
    width: '100%',
    marginTop: normalize(10, 'height'),
    marginBottom: normalize(5, 'height'),
  },

  emptyContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(130, 'height'),
  },
  emptyTxt: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: Colors.blackColor
  },

});