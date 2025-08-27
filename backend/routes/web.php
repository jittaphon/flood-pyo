<?php

/** @var \Laravel\Lumen\Routing\Router $router */
$router->options('/{any:.*}', function () {
    $response = response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // ตั้งค่า Cache-Control ให้ไม่เก็บข้อมูลใน Cache
    $response->headers->set('Cache-Control', 'no-store');

    return $response;
});


// กำหนดกลุ่ม API พร้อมเวอร์ชัน
$router->group(['prefix' => 'api/v1'], function () use ($router) {
    $router->get('/claim-reports', 'DataClaimReportController@getData');
    $router->get('/claim-reportsV2', 'DataClaimReportController@getDataV2GroupedSummary');
    $router->get('/claim-reportsDetailV2', 'DataClaimReportController@getDetailedV2GroupedData');
    $router->get('/claim-reports/listperiod', 'DataClaimReportController@getListPeriod');
    $router->get('/claim-reports/listHSENDFull', 'DataClaimReportController@getListSend_FULL');
    $router->get('/claim-reports/listHMainOP', 'DataClaimReportController@getListHmainOPFull');
    $router->get('/claim-reports/listnametype', 'DataClaimReportController@getListNameType');
    $router->get('/claim-reports/listpaytype', 'DataClaimReportController@getListPayType');
    $router->get('/claim-reports/listAffiliation', 'DataClaimReportController@getListAffiliation');
    $router->get('/claim-reports/listAmpurByAffiliation', 'DataClaimReportController@getAmpurByAffiliation');
    $router->get('/claim-reports/lsithmainop', 'DataClaimReportController@getListHmainOP');
});


$router->group(['prefix' => 'api/v2'], function () use ($router) {

    $router->group(['prefix' => 'tp-reports'], function () use ($router) {
        $router->get('/summary', 'DataTPReportController@getSummary');
        $router->get('/detail', 'DataTPReportController@getDetail');
        $router->get('/listnametype', 'DataTPReportController@getListNameType');
        $router->get('/lsithmainop', 'DataTPReportController@getListHmainOP');
    });


    $router->group(['prefix' => 'nap-reports'], function () use ($router) {
        $router->get('/summary', 'DataNapReportController@getSummary');
        $router->get('/detail', 'DataNapReportController@getDetail');
        $router->get('/listnametype', 'DataNapReportController@getListNameType');
        $router->get('/lsithmainop', 'DataNapReportController@getListHmainOP');
    });

    $router->group(['prefix' => 'moph-claim-reports'], function () use ($router) {
        $router->get('/summary', 'DataMCReportController@getSummary');
        $router->get('/detail', 'DataMCReportController@getDetail');
        $router->get('/listnametype', 'DataMCReportController@getListNameType');
        $router->get('/lsithmainop', 'DataMCReportController@getListHmainOP');
    });

    $router->group(['prefix' => 'ckd-reports'], function () use ($router) {
        $router->get('/summary', 'DataCKDReportController@getSummary');
        $router->get('/detail', 'DataCKDReportController@getDetail');
        $router->get('/listnametype', 'DataCKDReportController@getListNameType');
        $router->get('/lsithmainop', 'DataCKDReportController@getListHmainOP');
    });


    $router->group(['prefix' => 'list-filtter'], function () use ($router) {

        $router->get('/listHmainOP', 'ListFiltterController@getHcodeListFull');
        $router->get('/listAffiliation', 'ListFiltterController@getListAffiliation');
        $router->get('/listAumpurByAffiliation', 'ListFiltterController@getAmpurByAffiliation');
        $router->get('/listNameType', 'ListFiltterController@getListNameType');
    });

  
});
