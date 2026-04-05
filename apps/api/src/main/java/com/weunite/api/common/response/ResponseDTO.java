package com.weunite.api.common.response;

public record ResponseDTO<T>(String message, T data) {}
