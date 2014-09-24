'use strict';
/*global app:true*/
var loginRequired = function ($location, $q, $rootScope) {
  var deferred = $q.defer();
  if (!$rootScope.sessionUser) {
    deferred.reject();
    $location.path('/signup');
  } else {
    deferred.resolve();
  }
  return deferred.promise;
};
var app = angular.module('frontendApp', [
    'ngCookies',
    'angular-loading-bar',
    'ngResource',
    'ngAnnotateText',
    'ngSanitize',
    'ngRoute',
    'ui.sortable',
    'ui.bootstrap'
  ]);
app.config([
  'cfpLoadingBarProvider',
  '$routeProvider',
  '$locationProvider',
  function (cfpLoadingBarProvider, $routeProvider, $locationProvider) {
    cfpLoadingBarProvider.latencyThreshold = 10;
    Parse.initialize('OUU8h8AVe2mvNWLeT0aSOUZweL0Ku4uaU5xnCI0g', 'bhYqJ9b4wy2xseVo6U5zMy8Y7rQAoDtJVsObXpNH');
    $routeProvider.when('/pdftest', {
      templateUrl: 'views/pdftest.html',
      controller: 'PdfController'
    }).when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    }).when('/', {
      templateUrl: 'views/principal.html',
      controller: 'IndexCtrl'
    }).when('/create/:exerciseKey?', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      resolve: { loginRequired: loginRequired }
    }).when('/live/:exerciseKey', {
      templateUrl: '/views/liveview.html',
      controller: 'LiveCtrl',
      resolve: { loginRequired: loginRequired }
    }).when('/forgot', {
      templateUrl: 'views/forgot.html',
      controller: 'ForgotCtrl'
    }).when('/signup', {
      templateUrl: 'views/signup.html',
      controller: 'SignupCtrl'
    }).when('/myExercises', {
      templateUrl: '/views/myexercises.html',
      controller: 'MyExercisesCtrl',
      resolve: { loginRequired: loginRequired }
    }).when('/checkStep', {
      templateUrl: '/views/confirmation.html',
      controller: 'ConfirmationCtrl'
    }).when('/exercise/:exerciseKey', {
      templateUrl: '/views/exercise.html',
      controller: 'ExerciseCtrl'
    }).otherwise({ redirectTo: '/' });  // $locationProvider.html5Mode(true);
  }
]);
app.run([
  '$rootScope',
  function ($rootScope) {
    $rootScope.sessionUser = Parse.User.current();
  }
]);
(function () {
  var annotationIdCounter, getAnnotationById, insertAt, ngAnnotateText, parseAnnotations, sortAnnotationsByEndIndex;
  ngAnnotateText = angular.module('ngAnnotateText', []);
  annotationIdCounter = 0;
  insertAt = function (text, index, string) {
    return text.substr(0, index) + string + text.substr(index);
  };
  sortAnnotationsByEndIndex = function (annotations) {
    return annotations.sort(function (a, b) {
      if (a.endIndex < b.endIndex) {
        return -1;
      } else if (a.endIndex > b.endIndex) {
        return 1;
      }
      return 0;
    });
  };
  parseAnnotations = function (text, annotations, indexOffset) {
    var annotation, i, _i, _ref;
    if (annotations == null) {
      annotations = [];
    }
    if (indexOffset == null) {
      indexOffset = 0;
    }
    if (annotations.length === 0) {
      return text;
    }
    annotations = sortAnnotationsByEndIndex(annotations);
    for (i = _i = _ref = annotations.length - 1; _i >= 0; i = _i += -1) {
      annotation = annotations[i];
      text = insertAt(text, annotation.endIndex + indexOffset, '</span>');
      if (annotation.children.length) {
        text = parseAnnotations(text, annotation.children, annotation.startIndex + indexOffset);
      }
      text = insertAt(text, annotation.startIndex + indexOffset, '<span class="ng-annotate-text-annotation ng-annotate-text-' + annotation.id + ' ng-annotate-text-type-' + annotation.type + '" data-annotation-id="' + annotation.id + '">');
    }
    return text;
  };
  getAnnotationById = function (annotations, aId) {
    var a, an, _i, _len;
    for (_i = 0, _len = annotations.length; _i < _len; _i++) {
      a = annotations[_i];
      if (aId === a.id) {
        return a;
      }
      if (a.children.length > 0) {
        an = getAnnotationById(a.children, aId);
        if (an !== void 0) {
          return an;
        }
      }
    }
  };
  ngAnnotateText.factory('NGAnnotateTextPopup', function () {
    return function (args) {
      args = angular.extend({
        scope: null,
        callbacks: {},
        template: '<div/>',
        $anchor: null,
        preferredAxis: 'x',
        offset: 0,
        positionClass: '{{position}}'
      }, args);
      return angular.extend(this, args, {
        $el: angular.element(args.template),
        show: function (speed) {
          if (speed == null) {
            speed = 'fast';
          }
          this.$el.fadeIn(speed);
          this.reposition();
          if (typeof this.callbacks.show === 'function') {
            return this.callbacks.show(this.$el);
          }
        },
        hide: function (speed) {
          if (speed == null) {
            speed = 'fast';
          }
          this.$el.fadeOut(speed);
          if (typeof this.callbacks.hide === 'function') {
            return this.callbacks.hide(this.$el);
          }
        },
        isVisible: function () {
          return this.$el.is(':visible');
        },
        destroy: function (cb) {
          var $el, scope;
          if (cb == null) {
            cb = angular.noop;
          }
          scope = this.scope;
          $el = this.$el;
          return this.hide(function () {
            if (typeof cb === 'function') {
              cb();
            }
            scope.$destroy();
            return $el.remove();
          });
        },
        stopDestroy: function () {
          return this.$el.stop(true).show('fast');
        },
        reposition: function () {
          var anchorEl, pos, posX, posY, targetEl;
          targetEl = this.$el[0];
          anchorEl = this.$anchor[0];
          if (!(targetEl || anchorEl)) {
            return;
          }
          pos = {
            left: null,
            top: null,
            target: targetEl.getBoundingClientRect(),
            anchor: anchorEl.getBoundingClientRect(),
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            scroll: {
              top: document.body.scrollTop,
              left: document.body.scrollLeft
            }
          };
          if (!(pos.target.width > 0 && pos.target.height > 0)) {
            return;
          }
          posX = this.getNewPositionOnAxis(pos, 'x');
          posY = this.getNewPositionOnAxis(pos, 'y');
          if (this.preferredAxis === 'x') {
            if (posX && typeof posX.pos === 'number') {
              pos.left = posX.pos;
              pos.edge = posX.edge;
            } else if (posY) {
              pos.top = posY.pos;
              pos.edge = posY.edge;
            }
          } else {
            if (posY && typeof posY.pos === 'number') {
              pos.top = posY.pos;
              pos.edge = posY.edge;
            } else if (posX) {
              pos.left = posX.pos;
              pos.edge = posX.edge;
            }
          }
          if (pos.left === null && pos.top === null) {
            pos.left = pos.scroll.left + pos.viewport.width / 2 - pos.target.width / 2;
            pos.top = pos.scroll.top + pos.viewport.height / 2 - pos.target.height / 2;
          } else if (pos.left === null) {
            pos.left = this.getNewCenterPositionOnAxis(pos, 'x');
          } else if (pos.top === null) {
            pos.top = this.getNewCenterPositionOnAxis(pos, 'y');
          }
          this.$el.addClass(pos.edge && this.positionClass.replace('{{position}}', pos.edge)).css({
            top: Math.round(pos.top) || 0,
            left: Math.round(pos.left) || 0
          });
        },
        getNewPositionOnAxis: function (pos, axis) {
          var axisPos, end, size, start;
          start = {
            x: 'left',
            y: 'top'
          }[axis];
          end = {
            x: 'right',
            y: 'bottom'
          }[axis];
          size = {
            x: 'width',
            y: 'height'
          }[axis];
          if (pos.anchor[start] - this.offset >= pos.target[size]) {
            axisPos = {
              pos: pos.scroll[start] + pos.anchor[start] - this.offset - pos.target[size],
              edge: start
            };
          } else if (pos.viewport[size] - pos.anchor[end] - this.offset >= pos.target[size]) {
            axisPos = {
              pos: pos.scroll[start] + pos.anchor[end] + this.offset,
              edge: end
            };
          }
          return axisPos;
        },
        getNewCenterPositionOnAxis: function (pos, axis) {
          var centerPos, size, start;
          start = {
            x: 'left',
            y: 'top'
          }[axis];
          size = {
            x: 'width',
            y: 'height'
          }[axis];
          centerPos = pos.scroll[start] + pos.anchor[start] + pos.anchor[size] / 2 - pos.target[size] / 2;
          return Math.max(pos.scroll[start] + this.offset, Math.min(centerPos, pos.scroll[start] + pos.viewport[size] - pos.target[size] - this.offset));
        }
      });
    };
  });
  ngAnnotateText.factory('NGAnnotation', function () {
    var Annotation;
    Annotation = function (data) {
      angular.extend(this, {
        id: annotationIdCounter++,
        startIndex: null,
        endIndex: null,
        data: { points: 0 },
        type: '',
        children: []
      });
      if (data != null) {
        return angular.extend(this, data);
      }
    };
    return Annotation;
  });
  ngAnnotateText.directive('ngAnnotateText', [
    '$rootScope',
    '$compile',
    '$http',
    '$q',
    '$controller',
    '$sce',
    'NGAnnotation',
    'NGAnnotateTextPopup',
    function ($rootScope, $compile, $http, $q, $controller, $sce, NGAnnotation, NGAnnotateTextPopup) {
      return {
        restrict: 'E',
        scope: {
          text: '=',
          annotations: '=',
          readonly: '=',
          popupController: '=',
          popupTemplateUrl: '=',
          tooltipController: '=',
          tooltipTemplateUrl: '=',
          onAnnotate: '=',
          onAnnotateDelete: '=',
          onAnnotateError: '=',
          onPopupShow: '=',
          onPopupHide: '=',
          popupOffset: '='
        },
        template: '<p ng-bind-html="content"></p>',
        replace: true,
        compile: function (el, attr) {
          if (attr.readonly == null) {
            attr.readonly = false;
          }
          return this.postLink;
        },
        postLink: function ($scope, element, attrs) {
          var POPUP_OFFSET, activePopup, activeTooltip, clearPopup, clearPopups, clearSelection, clearTooltip, createAnnotation, loadAnnotationPopup, onAnnotationsChange, onClick, onMouseEnter, onMouseLeave, onSelect, popupTemplateData, removeAnnotation, removeChildren, tooltipTemplateData, _ref;
          POPUP_OFFSET = (_ref = $scope.popupOffset) != null ? _ref : 10;
          activePopup = null;
          activeTooltip = null;
          popupTemplateData = '';
          tooltipTemplateData = '';
          onAnnotationsChange = function () {
            var t;
            if ($scope.text == null || !$scope.text.length) {
              return;
            }
            t = parseAnnotations($scope.text, $scope.annotations);
            return $scope.content = $sce.trustAsHtml(t);
          };
          $scope.$watch('text', onAnnotationsChange);
          $scope.$watch('annotations', onAnnotationsChange, true);
          clearPopup = function () {
            var tId;
            if (activePopup == null) {
              return;
            }
            tId = activePopup.scope.$annotation.id;
            return activePopup.destroy(function () {
              if (activePopup.scope.$annotation.id === tId) {
                return activePopup = null;
              }
            });
          };
          clearTooltip = function () {
            var tooltip;
            tooltip = activeTooltip;
            if (tooltip == null) {
              return;
            }
            return tooltip.destroy(function () {
              if (activeTooltip === tooltip) {
                return activeTooltip = null;
              }
            });
          };
          clearPopups = function () {
            clearPopup();
            return clearTooltip();
          };
          $scope.$on('$destroy', clearPopups);
          $scope.$on('ngAnnotateText.clearPopups', clearPopups);
          if ($scope.popupTemplateUrl) {
            $http.get($scope.popupTemplateUrl).then(function (response) {
              return popupTemplateData = response.data;
            });
          }
          if ($scope.tooltipTemplateUrl) {
            $http.get($scope.tooltipTemplateUrl).then(function (response) {
              return tooltipTemplateData = response.data;
            });
          }
          removeChildren = function (annotation) {
            var a, i, _i, _ref1, _results;
            _results = [];
            for (i = _i = _ref1 = annotation.children.length - 1; _i >= 0; i = _i += -1) {
              a = annotation.children[i];
              removeChildren(a);
              _results.push(a.children.splice(i, 1));
            }
            return _results;
          };
          removeAnnotation = function (id, annotations) {
            var a, i, _i, _len;
            for (i = _i = 0, _len = annotations.length; _i < _len; i = ++_i) {
              a = annotations[i];
              removeAnnotation(id, a.children);
              if (a.id === id) {
                removeChildren(a);
                annotations.splice(i, 1);
                return;
              }
            }
          };
          createAnnotation = function () {
            var annotation, annotationParentCollection, attrId, parentAnnotation, parentId, prevAnnotation, prevSiblingId, prevSiblingSpan, range, sel;
            annotation = new NGAnnotation();
            sel = window.getSelection();
            if (sel.isCollapsed) {
              throw new Error('NG_ANNOTATE_TEXT_NO_TEXT_SELECTED');
            }
            range = sel.getRangeAt(0);
            if (range.startContainer !== range.endContainer) {
              throw new Error('NG_ANNOTATE_TEXT_PARTIAL_NODE_SELECTED');
            }
            if (range.startContainer.parentNode.nodeName === 'SPAN') {
              parentId = (attrId = range.startContainer.parentNode.getAttribute('data-annotation-id')) != null ? parseInt(attrId, 10) : void 0;
              if (parentId === void 0) {
                throw new Error('NG_ANNOTATE_TEXT_ILLEGAL_SELECTION');
              }
              parentAnnotation = getAnnotationById($scope.annotations, parentId);
              annotationParentCollection = parentAnnotation.children;
            } else {
              annotationParentCollection = $scope.annotations;
            }
            if (annotationParentCollection.length) {
              prevSiblingSpan = range.startContainer.previousSibling;
              if (prevSiblingSpan != null) {
                prevSiblingId = (attrId = prevSiblingSpan.getAttribute('data-annotation-id')) != null ? parseInt(attrId, 10) : void 0;
                if (prevSiblingId == null) {
                  throw new Error('NG_ANNOTATE_TEXT_ILLEGAL_SELECTION');
                }
                prevAnnotation = getAnnotationById($scope.annotations, prevSiblingId);
                annotation.startIndex = prevAnnotation.endIndex + range.startOffset;
                annotation.endIndex = prevAnnotation.endIndex + range.endOffset;
              } else {
                annotation.startIndex = range.startOffset;
                annotation.endIndex = range.endOffset;
              }
            } else {
              annotation.startIndex = range.startOffset;
              annotation.endIndex = range.endOffset;
            }
            annotationParentCollection.push(annotation);
            clearSelection();
            return annotation;
          };
          clearSelection = function () {
            if (document.selection) {
              return document.selection.empty();
            } else if (window.getSelection && window.getSelection().empty) {
              return window.getSelection().empty();
            } else if (window.getSelection && window.getSelection().removeAllRanges) {
              return window.getSelection().removeAllRanges();
            }
          };
          onSelect = function (event) {
            var $span, annotation, ex;
            if (popupTemplateData.length === 0) {
              return;
            }
            try {
              annotation = createAnnotation();
              $scope.$apply();
              $span = element.find('.ng-annotate-text-' + annotation.id);
            } catch (_error) {
              ex = _error;
              if ($scope.onAnnotateError != null) {
                $scope.onAnnotateError(ex);
              }
              return;
            }
            clearPopups();
            return loadAnnotationPopup(annotation, $span, true);
          };
          onClick = function (event) {
            var $target, annotation, attrId, targetId;
            if (popupTemplateData.length === 0) {
              return;
            }
            $target = angular.element(event.target);
            targetId = (attrId = $target.attr('data-annotation-id')) != null ? parseInt(attrId, 10) : void 0;
            if (targetId == null) {
              return;
            }
            if (activePopup != null && activePopup.scope.$annotation.id === targetId) {
              clearPopup();
              return;
            }
            annotation = getAnnotationById($scope.annotations, targetId);
            clearPopups();
            return loadAnnotationPopup(annotation, $target, false);
          };
          onMouseEnter = function (event) {
            var $target, annotation, attrId, controller, locals, targetId, tooltip;
            if (tooltipTemplateData.length === 0) {
              return;
            }
            event.stopPropagation();
            $target = angular.element(event.target);
            targetId = (attrId = $target.attr('data-annotation-id')) != null ? parseInt(attrId, 10) : void 0;
            if (activeTooltip != null && activeTooltip.scope.$annotation.id === targetId) {
              activeTooltip.stopDestroy();
              return;
            } else {
              clearTooltip();
            }
            if (targetId == null) {
              return;
            }
            annotation = getAnnotationById($scope.annotations, targetId);
            if (activePopup != null || !annotation.data.comment && !annotation.data.points) {
              return;
            }
            tooltip = new NGAnnotateTextPopup({
              scope: $rootScope.$new(),
              template: '<div class=\'ng-annotate-text-tooltip\' />',
              positionClass: 'ng-annotate-text-tooltip-docked ng-annotate-text-tooltip-docked-{{position}}',
              $anchor: $target,
              preferredAxis: 'y',
              offset: POPUP_OFFSET
            });
            tooltip.scope.$annotation = annotation;
            activeTooltip = tooltip;
            locals = {
              $scope: tooltip.scope,
              $template: tooltipTemplateData
            };
            tooltip.$el.html(locals.$template);
            tooltip.$el.appendTo('body');
            if ($scope.tooltipController) {
              controller = $controller($scope.tooltipController, locals);
              tooltip.$el.data('$ngControllerController', controller);
              tooltip.$el.children().data('$ngControllerController', controller);
            }
            $compile(tooltip.$el)(tooltip.scope);
            tooltip.scope.$apply();
            return tooltip.show();
          };
          onMouseLeave = function (event) {
            var $target, attrId, targetId;
            event.stopPropagation();
            $target = angular.element(event.target);
            targetId = (attrId = $target.attr('data-annotation-id')) != null ? parseInt(attrId, 10) : void 0;
            if (targetId == null) {
              return;
            }
            return clearTooltip();
          };
          loadAnnotationPopup = function (annotation, anchor, isNew) {
            var controller, locals, popup;
            popup = new NGAnnotateTextPopup({
              scope: $rootScope.$new(),
              callbacks: {
                show: $scope.onPopupShow,
                hide: $scope.onPopupHide
              },
              template: '<div class=\'ng-annotate-text-popup\' />',
              positionClass: 'ng-annotate-text-popup-docked ng-annotate-text-popup-docked-{{position}}',
              $anchor: anchor,
              offset: POPUP_OFFSET
            });
            popup.scope.$isNew = isNew;
            popup.scope.$annotation = annotation;
            popup.scope.$readonly = $scope.readonly;
            popup.scope.$reject = function () {
              removeAnnotation(annotation.id, $scope.annotations);
              if ($scope.onAnnotateDelete != null) {
                $scope.onAnnotateDelete(annotation);
              }
              clearPopup();
            };
            popup.scope.$close = function () {
              if ($scope.onAnnotate != null) {
                $scope.onAnnotate(popup.scope.$annotation);
              }
              clearPopup();
            };
            activePopup = popup;
            locals = {
              $scope: popup.scope,
              $template: popupTemplateData
            };
            popup.$el.html(locals.$template);
            popup.$el.appendTo('body');
            if ($scope.popupController) {
              controller = $controller($scope.popupController, locals);
              popup.$el.data('$ngControllerController', controller);
              popup.$el.children().data('$ngControllerController', controller);
            }
            $compile(popup.$el)(popup.scope);
            popup.scope.$apply();
            return popup.show();
          };
          element.on('mouseenter', 'span', onMouseEnter);
          element.on('mouseleave', 'span', onMouseLeave);
          return element.on('mouseup', function (event) {
            var selection;
            selection = window.getSelection();
            if (!selection.isCollapsed && !$scope.readonly) {
              return onSelect(event);
            } else if (selection.isCollapsed && event.target.nodeName === 'SPAN') {
              return onClick(event);
            } else if (selection.isCollapsed) {
              return clearPopups();
            }
          });
        }
      };
    }
  ]);
}.call(this));
//# sourceMappingURL=ng-annotate-text-latest.js.map
/*! iGrowl v1.0 
	Copyright (c) 2014 Catalin Covic 
	https://github.com/catc 
*/
(function (e) {
  'use strict';
  var t = 'webkitAnimationStart oanimationstart MSAnimationStart animationstart', n = 'webkitAnimationEnd oanimationend MSAnimationEnd animationend', r = '<div class="igrowl animated"><div class="igrowl-text"></div><button class="igrowl-dismiss i-times"></button></div>';
  var i = function (t) {
      var t = e.extend(true, {}, e.iGrowl.prototype.defaults, t);
      this.options = t;
      this.template = s(t);
      o.call(this);
      return this;
    }, s = function (t) {
      if (!t.title && !t.message)
        throw new Error('You must enter at least a title or message.');
      var n = e(r);
      if (t.small) {
        n.addClass('igrowl-small');
      }
      n.addClass('igrowl-' + t.type);
      if (t.icon)
        n.prepend('<div class="igrowl-icon i-' + t.icon + '"></div>');
      if (t.title)
        n.find('.igrowl-text').prepend('<div class="igrowl-title">' + t.title + '</div>');
      if (t.message)
        n.find('.igrowl-text').append('<div class="igrowl-message">' + t.message + '</div>');
      n.attr('alert-placement', t.placement.x + ' ' + t.placement.y);
      return n;
    }, o = function () {
      var r = this.options, i = this.template;
      var s = e('.igrowl[alert-placement="' + r.placement.x + ' ' + r.placement.y + '"]').last(), o = r.offset.y, a = this;
      if (s.length) {
        o = parseInt(s.css(r.placement.y), 10) + s.outerHeight() + r.spacing;
      }
      i.css(r.placement.y, o);
      r.placement.x === 'center' ? i.addClass('igrowl-center') : i.css(r.placement.x, r.offset.x);
      e('body').append(i);
      if (r.animation) {
        i.addClass(r.animShow).one(t, function (e) {
          if (typeof r.onShow === 'function')
            r.onShow();
        }).one(n, function (e) {
          u.call(a);
        });
      } else {
        u.call(a);
      }
    }, u = function () {
      var e = this.options, t = this.template;
      if (typeof e.onShown === 'function')
        e.onShown();
      var n = this;
      if (e.delay > 0) {
        setTimeout(function () {
          n.dismiss();
        }, e.delay);
      }
      t.find('.igrowl-dismiss').on('click', function () {
        n.dismiss();
      });
    }, a = function () {
      var t = this.options, n = e(this.template);
      n.nextAll('.igrowl[alert-placement="' + t.placement.x + ' ' + t.placement.y + '"]').each(function (r, i) {
        var s = parseInt(e(this).css(t.placement.y), 10) - n.outerHeight() - t.spacing;
        e(i).css(t.placement.y, s);
      });
      n.remove();
    };
  i.prototype = {
    dismiss: function (e, r) {
      var i = this.options, r = this.template, s = this;
      if (i.animation) {
        this.template.removeClass(i.animShow).addClass(i.animHide).one(t, function (e) {
          if (typeof i.onHide === 'function')
            i.onHide();
        }).one(n, function (e) {
          if (typeof i.onHidden === 'function')
            i.onHidden();
          a.call(s);
        });
        setTimeout(function () {
          r.hide();
          a.call(s);
        }, 1500);
      } else {
        r.hide();
        if (typeof i.onHidden === 'function')
          i.onHidden();
        a.call(s);
      }
    }
  };
  e.iGrowl = function (e) {
    var t = new i(e);
    return t;
  };
  e.iGrowl.prototype.defaults = {
    type: 'info',
    title: null,
    message: null,
    icon: null,
    small: false,
    delay: 2500,
    spacing: 30,
    placement: {
      x: 'right',
      y: 'top'
    },
    offset: {
      x: 20,
      y: 20
    },
    animation: true,
    animShow: 'bounceIn',
    animHide: 'bounceOut',
    onShow: null,
    onShown: null,
    onHide: null,
    onHidden: null
  };
}(jQuery));
app.controller('ForgotCtrl', [
  '$scope',
  '$rootScope',
  'UserBackend',
  '$location',
  function ($scope, $rootScope, UserBackend, $location) {
    $scope.user = {};
    if ($rootScope.sessionUser) {
      $location.path('/myExercises');
    }
    $scope.recover = function () {
      $('#recoveryButton').html('Locating email...');
      console.log('clicked');
      Parse.User.requestPasswordReset($scope.user.email_add, {
        success: function () {
          $scope.recoveredEmail = true;
          $scope.$apply();
        },
        error: function (error) {
          // Show the error message somewhere
          $scope.wrongEmail = true;
          $scope.$apply();
          console.log($scope.wrongEmail);
          console.log('Error: ' + error.code + ' ' + error.message);
        }
      });
    };
  }
]);
'use strict';
/*global app:true*/
app.controller('SignupCtrl', [
  '$scope',
  '$rootScope',
  'UserBackend',
  '$location',
  function ($scope, $rootScope, UserBackend, $location) {
    $scope.user = {};
    if ($rootScope.sessionUser) {
      $location.path('/myExercises');
    }
    $scope.signup = function () {
      console.log('clicked');
      var user = new Parse.User();
      user.set('username', $scope.user.email_add);
      user.set('password', $scope.user.password);
      user.set('email', $scope.user.email_add);
      user.signUp(null, {
        success: function (user) {
          $rootScope.sessionUser = user;
          $scope.$apply(function () {
            $location.path('/myExercises');
          });
        },
        error: function (user, error) {
          // Show the error message somewhere and let the user try again.
          $scope.signUpError = true;
          console.log('Error: ' + error.code + ' ' + error.message);
          $scope.$apply();
        }
      });
    };
  }
]);
'use strict';
/*global app:true*/
app.factory('UserBackend', [
  '$q',
  '$rootScope',
  function ($q, $rootScope) {
    var User = Parse.User.extend({}, {});
    var u;
    return {
      getExercises: function () {
        var defer = $q.defer();
        console.log('run');
        var query = new Parse.Query('Exercise');
        query.equalTo('owner', Parse.User.current());
        query.find({
          success: function (exercises) {
            console.log(exercises);
            defer.resolve(exercises);
          },
          error: function (obj, error) {
            console.log(error);
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      signUp: function (username, password) {
        console.log('signed');
        var defer = $q.defer();
        u = new User();
        u.set('username', username);
        u.set('password', password);
        u.signUp(null, {
          success: function (user) {
            $rootScope.sessionUser = u;
            defer.resolve(user);
          },
          error: function (object, error) {
            console.log(error);
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      login: function (username, password) {
        var defer = $q.defer();
        Parse.User.logIn(username, password, {
          success: function (user) {
            $rootScope.sessionUser = user;
            defer.resolve(user);
          },
          error: function (user, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      logout: function () {
        Parse.User.logOut();
        $rootScope.sessionUser = Parse.User.current();
      }
    };
  }
]);
app.factory('ExerciseBackend', [
  '$q',
  function ($q) {
    var Exercise = Parse.Object.extend('Exercise', {
        initialize: function (attrs, options) {
          this.sound = 'Rawr';
        }
      }, {
        get: function (id) {
          var defer = $q.defer();
          var query = new Parse.Query(this);
          query.get(id, {
            success: function (item) {
              defer.resolve(item);
            },
            error: function (object, aError) {
              defer.reject(aError);
            }
          });
          return defer.promise;
        }
      });
    // Title property
    Object.defineProperty(Exercise.prototype, 'title', {
      get: function () {
        return this.get('title');
      },
      set: function (aValue) {
        this.set('title', aValue);
      }
    });
    Object.defineProperty(Exercise.prototype, 'annotations', {
      get: function () {
        return this.get('annotations');
      },
      set: function (aValue) {
        this.set('annotations', aValue);
      }
    });
    Object.defineProperty(Exercise.prototype, 'sentences', {
      get: function () {
        return this.get('sentences');
      },
      set: function (aValue) {
        this.set('sentences', aValue);
      }
    });
    Object.defineProperty(Exercise.prototype, 'description', {
      get: function () {
        return this.get('description');
      },
      set: function (aValue) {
        this.set('description', aValue);
      }
    });
    return Exercise;
  }
]);
app.factory('ExerciseAttempt', [
  '$q',
  function ($q) {
    var ExerciseAttempt = Parse.Object.extend('exerciseAttempt', {
        initialize: function (attrs, options) {
        }
      }, {
        get: function (id) {
          var defer = $q.defer();
          var query = new Parse.Query(this);
          query.get(id, {
            success: function (item) {
              defer.resolve(item);
            },
            error: function (object, aError) {
              defer.reject(aError);
            }
          });
          return defer.promise;
        },
        find: function (exercise_key) {
          var defer = $q.defer();
          var query = new Parse.Query(this);
          query.equalTo('exercise', exercise_key);
          query.find({
            success: function (results) {
              defer.resolve(results);
            },
            error: function (error) {
              console.log(error);
              defer.resolve(error);
            }
          });
          return defer.promise;
        }
      });
    // Title property
    Object.defineProperty(ExerciseAttempt.prototype, 'exercise', {
      get: function () {
        return this.get('exercise');
      },
      set: function (aValue) {
        this.set('exercise', aValue);
      }
    });
    Object.defineProperty(ExerciseAttempt.prototype, 'order', {
      get: function () {
        return this.get('order');
      },
      set: function (aValue) {
        this.set('order', aValue);
      }
    });
    return ExerciseAttempt;
  }
]);
app.controller('LiveCtrl', [
  '$routeParams',
  '$scope',
  '$rootScope',
  'UserBackend',
  'ExerciseBackend',
  'ExerciseAttempt',
  'NGAnnotation',
  function ($routeParams, $scope, $rootScope, UserBackend, ExerciseBackend, ExerciseAttempt, NGAnnotation) {
    Array.prototype.equals = function (array) {
      // if the other array is a falsy value, return
      if (!array)
        return false;
      // compare lengths - can save a lot of time 
      if (this.length != array.length)
        return false;
      for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
          // recurse into the nested arrays
          if (!this[i].equals(array[i]))
            return false;
        } else if (this[i] != array[i]) {
          // Warning - two different object instances will never be equal: {x:20} != {x:20}
          return false;
        }
      }
      return true;
    };
    function buildExamples(arr) {
      if (arr.length < 1) {
        return [];
      }
      var result = [];
      var possibilities = arr[0];
      for (var i = 0; i < possibilities.length; i++) {
        var build = [];
        for (var x = 0; x < possibilities[i].length; x++) {
          console.log(possibilities[i]);
          build.push($scope.exercise.sentences[possibilities[i][x]]);
        }
        result.push(build);
      }
      console.log(result);
      return result;
    }
    function foo(arr) {
      var a = [], b = [], prev;
      arr.sort();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].equals(prev) == false) {
          a.push(arr[i]);
          b.push(1);
        } else {
          b[b.length - 1]++;
        }
        prev = arr[i];
      }
      return [
        a,
        b
      ];
    }
    $scope.exercise = {};
    $scope.results = [];
    $scope.resultsArray = [];
    $scope.build = [];
    $scope.restart = function () {
      console.log('deleted');
      Parse.Object.destroyAll($scope.parseResults);
      console.log($scope.parseResults);
    };
    ExerciseBackend.get($routeParams.exerciseKey).then(function (obj) {
      $scope.notelength = obj.annotations.length;
      $scope.exercise.id = obj.id;
      $scope.exercise.notes = [];
      $scope.exercise.title = obj.title;
      $scope.exercise.kind = obj.kind;
      $scope.exercise.sentences = obj.sentences;
      for (var item = 0; item < obj.annotations.length; item++) {
        var itemNotes = [];
        for (var notes = 0; notes < obj.annotations[item].length; notes++) {
          var thisNote = obj.annotations[item][notes];
          itemNotes.push(new NGAnnotation({
            startIndex: thisNote.startIndex,
            endIndex: thisNote.endIndex,
            type: thisNote.type,
            data: { comment: thisNote.data.comment }
          }));
        }
        $scope.exercise.notes.push(itemNotes);
      }
      $scope.exercise.annotations = $scope.exercise.notes;
      ExerciseAttempt.find($routeParams.exerciseKey).then(function (results) {
        $scope.parseResults = results;
        $scope.results = [];
        $scope.resultsArray = [];
        for (var i = 0; i <= results[0].order.length; i++) {
          $scope.resultsArray.push(Array.apply(null, new Array(results[0].order.length + 1)).map(Number.prototype.valueOf, 0));
        }
        for (var solution = 0; solution < results.length; solution++) {
          $scope.results.push(results[solution].order);
          for (var paragraph = 0; paragraph < results[solution].order.length; paragraph++) {
            if (paragraph == 0) {
              $scope.resultsArray[0][results[solution].order[paragraph] + 1] += 1;
            } else {
              $scope.resultsArray[results[solution].order[paragraph - 1] + 1][results[solution].order[paragraph] + 1] += 1;
            }
          }
        }
        $scope.count = foo($scope.results);
        $scope.build = buildExamples($scope.count);
        var matrix = $scope.resultsArray;
        var chord = d3.layout.chord().padding(0.2).sortSubgroups(d3.ascending).matrix(matrix);
        var width = parseInt(d3.select('#chart').style('width'), 10), height = parseInt(d3.select('#chart').style('width'), 10), innerRadius = Math.min(width, height) * 0.41, outerRadius = innerRadius * 1.1;
        var fill = d3.scale.ordinal().domain(d3.range(6)).range([
            '#a457aa',
            '#3eda7f',
            '#afc619',
            '#FFDD89',
            '#957244',
            '#F26223',
            '#00FF00',
            '#FF0000',
            '#0000FF'
          ]);
        var svg = d3.select('#chart').append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
        svg.append('g').selectAll('path').data(chord.groups).enter().append('path').style('fill', function (d) {
          return fill(d.index);
        }).style('stroke', function (d) {
          return fill(d.index);
        }).attr('d', d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)).on('mouseover', fade(0.1)).on('mouseout', fade(1));
        var ticks = svg.append('g').selectAll('g').data(chord.groups).enter().append('g').selectAll('g').data(groupTicks).enter().append('g').attr('transform', function (d) {
            return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')' + 'translate(' + outerRadius + ',0)';
          });
        // ticks.append("line")
        //     .attr("x1", 1)
        //     .attr("y1", 0)
        //     .attr("x2", 5)
        //     .attr("y2", 0)
        //     .style("stroke", "#000");
        // ticks.append("text")
        //     .attr("x", 8)
        //     .attr("dy", ".35em")
        //     .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
        //     .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        //     .text(function(d) { return d.label; });
        svg.append('g').attr('class', 'chord').selectAll('path').data(chord.chords).enter().append('path').attr('d', d3.svg.chord().radius(innerRadius)).style('fill', function (d) {
          return fill(d.target.index);
        }).style('opacity', 1);
        // Returns an array of tick angles and labels, given a group.
        function groupTicks(d) {
          var k = (d.endAngle - d.startAngle) / d.value;
          return d3.range(0, d.value, 1000).map(function (v, i) {
            return {
              angle: v * k + d.startAngle,
              label: i % 5 ? null : v / 1000 + 'k'
            };
          });
        }
        // Returns an event handler for fading a given chord group.
        function fade(opacity) {
          return function (g, i) {
            svg.selectAll('.chord path').filter(function (d) {
              return d.source.index != i && d.target.index != i;
            }).transition().style('opacity', opacity);
          };
        }
      });
    });  // var matrix = $scope.resultsArray;
  }
]);
'use strict';
/*global app:true*/
/*global $:false */
app.controller('MainCtrl', [
  '$scope',
  '$routeParams',
  'NGAnnotation',
  'ExerciseBackend',
  '$rootScope',
  function ($scope, $routeParams, NGAnnotation, ExerciseBackend, $rootScope) {
    $scope.content = 'Insert your content here';
    $scope.stage = 0;
    $scope.annotations = [];
    $scope.sortables = [];
    $scope.original = [];
    $scope.radioModel = 'Element';
    if ($routeParams.exerciseKey) {
      console.log($routeParams.exerciseKey);
      ExerciseBackend.get($routeParams.exerciseKey).then(function (obj) {
        var content = '';
        for (var i = 0; i < obj.sentences.length; i++) {
          content += obj.sentences[i].text;
          content += '\n';
        }
        $scope.content = content;
        $scope.stage = 0;
        $scope.kind = obj.kind;
        $scope.activityTitle = obj.title;
        $scope.activityDescription = obj.description;
      });
    } else {
      $scope.content = 'Insert your content here';
      $scope.stage = 0;
      $scope.annotations = [];
      $scope.sortables = [];
      $scope.original = [];
      $scope.radioModel = 'Element';
    }
    $scope.transition = function (dir) {
      if ($scope.stage === 1 && dir === -1) {
        console.log('oops');
        $scope.stage -= 1;
      } else {
        $scope.stage += dir;
      }
    };
    $scope.updateDatabase = function () {
      var testObject = new ExerciseBackend();
      $scope.update(true);
      $('#saveButton').html('Saving Now...');
      testObject.set('title', $scope.activityTitle);
      if ($scope.radioModel === 'Element') {
        testObject.set('kind', 'Paragraph');
      } else {
        testObject.set('kind', $scope.radioModel);
      }
      testObject.set('description', $scope.activityDescription);
      testObject.set('sentences', $scope.sortables);
      testObject.set('annotations', $scope.annotations);
      testObject.set('owner', $rootScope.sessionUser);
      testObject.save(null, {
        success: function (object) {
          console.log(object);
          $scope.activityID = object.id;
          $scope.$apply();
          $('#successModal').modal();
          $('#saveButton').html('Saved!');
        },
        error: function (model, error) {
          $('#saveButton').html('Oops!');
        }
      });
    };
    $scope.update = function (creation) {
      var str = $scope.content.replace(/(?:\r\n|\r|\n)/g, '<br>');
      if (str.length > 0) {
        $('#final').html(str);
        $scope.pieces = $('#final').blast({ delimiter: $scope.radioModel });
        $('#final span').filter(':even').css('color', '#0c5d99');
        $('#final span').filter(':odd').css('color', '#dd1f7b');
        $scope.sortables = [];
        $scope.original = [];
        if (creation != true) {
          console.log('2');
          $scope.annotations = [];
        }
        for (var i = 0; i < $scope.pieces.length; i++) {
          $scope.sortables.push({
            text: $scope.pieces[i].innerText,
            order: i
          });
          $scope.original.push($scope.pieces[i].innerText);
          if (creation != true) {
            $scope.annotations.push([]);
          }
        }
      } else {
        $scope.sortables = [];
        $scope.annotations = [];
      }
    };
    $scope.checkActivity = function () {
      var display = $scope.sortables[0].text;
      var toChange = display.substr(0, 10);
      var newText = '<span class="ng-annotatetext-annotation ng-annotate-text-tyoe-blue">' + toChange + '</span>';
      $scope.sortables[0].text = display + newText;
      console.log($scope.sortables[0].text);
    };
    $scope.$watch('radioModel', function () {
      $scope.update();
    });
    $scope.$watch('content', function () {
      $scope.update();
    });
    $scope.onAnnotate = function ($annotation) {
      console && console.log($annotation);
    };
    $scope.onAnnotateError = function ($ex) {
      if ($ex.message === 'NG_ANNOTATE_TEXT_PARTIAL_NODE_SELECTED') {
        return alert('Invalid selection.');
      } else {
        throw $ex;
      }
    };
    $scope.onPopupShow = function ($el) {
      var firstInput;
      firstInput = $el.find('input, textarea').eq(0).focus();
      return firstInput && firstInput[0].select();
    };
    $scope.hasPoints = function (points) {
      var _isNaN;
      _isNaN = Number.isNaN || isNaN;
      return typeof points === 'number' && points !== 0 && !_isNaN(points);
    };
    $scope.hasComment = function (comment) {
      return typeof comment === 'string' && comment.length > 0;
    };
    $scope.annotationsAsFlatList = function (annotations) {
      if (annotations == null) {
        annotations = $scope.annotations[0];
      }
      if (!annotations.length) {
        return [];
      } else {
        return annotations.map(function (annotation) {
          var arr;
          arr = [];
          if ($scope.hasPoints(annotation.data.points) && $scope.hasComment(annotation.data.comment)) {
            arr.push(annotation);
          }
          if (annotation.children && annotation.children.length) {
            arr = arr.concat($scope.annotationsAsFlatList(annotation.children));
          }
          return arr;
        }).reduce(function (prev, current) {
          return prev.concat(current);
        });
      }
    };
    return $scope.clearPopups = function () {
      return $scope.$broadcast('ngAnnotateText.clearPopups');
    };
  }
]);
'use strict';
/*global app:true*/
/*global jsPDF():true*/
app.controller('ExerciseCtrl', [
  '$scope',
  '$modal',
  '$routeParams',
  '$sce',
  'NGAnnotation',
  'ExerciseBackend',
  function ($scope, $modal, $routeParams, $sce, NGAnnotation, ExerciseBackend) {
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    }
    ;
    $scope.score = [0];
    $scope.exercise = {};
    $scope.attempts = 0;
    ExerciseBackend.get($routeParams.exerciseKey).then(function (obj) {
      console.log(obj);
      $scope.obj = obj;
      $scope.notelength = obj.annotations.length;
      $scope.exercise.notes = [];
      $scope.exercise.title = obj.title;
      $scope.exercise.kind = obj.kind;
      $scope.exercise.sentences = shuffle(obj.sentences);
    });
    $scope.downloadWorksheet = function () {
      // @TODO: Need to simplify this demo
      var doc = new jsPDF('p', 'in', 'letter'), sizes = [
          12,
          16,
          20
        ], fonts = [
          [
            'Times',
            'Roman'
          ],
          [
            'Helvetica',
            ''
          ],
          [
            'Times',
            'Italic'
          ]
        ], font, size, lines, margin = 2, verticalOffset = margin;
      doc.setLineWidth(1 / 72).roundedRect(0.1, 0.1, 8.3, 1.7, 0.1, 0.1);
      doc.setFontSize(24).text(3.5, 1, 'Word Scrambler');
      // Margins:
      doc.setDrawColor(0, 255, 0).setLineWidth(1 / 72).setFontSize(10);
      var offset = 3;
      doc.setDrawColor(0, 0, 0);
      for (var i = 0; i < $scope.exercise.sentences.length; i++) {
        doc.text(1, offset, '_________');
        console.log($scope.exercise.sentences[i]);
        lines = doc.setFontSize(10).splitTextToSize($scope.exercise.sentences[i].text, 6);
        doc.roundedRect(margin - 0.1, offset - 0.2, 6 + 0.2, lines.length / 72 * 10 + 0.2, 0.1, 0.1);
        doc.text(margin, offset, lines);
        offset += lines.length / 72 * 10 + 0.5;
      }
      // .line(8.5 - margin, margin, 8.5-margin, 11-margin)
      // the 3 blocks of text
      // for (var i in fonts){
      //   if (fonts.hasOwnProperty(i)) {
      //     font = fonts[i]
      //     size = sizes[i]
      //     lines = doc.setFont(font[0], font[1])
      //           .setFontSize(size)
      //           .splitTextToSize(loremipsum, 7.5)
      //     // Don't want to preset font, size to calculate the lines?
      //     // .splitTextToSize(text, maxsize, options)
      //     // allows you to pass an object with any of the following:
      //     // {
      //     //  'fontSize': 12
      //     //  , 'fontStyle': 'Italic'
      //     //  , 'fontName': 'Times'
      //     // }
      //     // Without these, .splitTextToSize will use current / default
      //     // font Family, Style, Size.
      //     doc.text(0.5, verticalOffset + size / 72, lines)
      //     verticalOffset += (lines.length + 0.5) * size / 72
      //   }
      // }
      doc.save('Text Scrambler - ' + $scope.exercise.title);
    };
    $scope.calculateAttempt = function () {
      if ($scope.attempts == 0) {
        for (var item = 0; item < $scope.obj.annotations.length; item++) {
          var itemNotes = [];
          for (var notes = 0; notes < $scope.obj.annotations[item].length; notes++) {
            var thisNote = $scope.obj.annotations[item][notes];
            itemNotes.push(new NGAnnotation({
              startIndex: thisNote.startIndex,
              endIndex: thisNote.endIndex,
              type: thisNote.type,
              data: { comment: thisNote.data.comment }
            }));
          }
          $scope.exercise.notes.push(itemNotes);
        }
        $scope.exercise.annotations = $scope.exercise.notes;
        $scope.firstAttempt = angular.copy($scope.exercise.sentences);
        var exerciseAttempt = Parse.Object.extend('exerciseAttempt');
        var exerciseAttempt = new exerciseAttempt();
        var order = [];
        exerciseAttempt.set('exercise', $routeParams.exerciseKey);
        for (var i = 0; i < $scope.exercise.sentences.length; i++) {
          order.push($scope.exercise.sentences[i].order);
        }
        exerciseAttempt.set('order', order);
        exerciseAttempt.save();
      }
      $scope.attempts += 1;
      var score = 0;
      for (var i = 0; i < $scope.exercise.sentences.length; i++) {
        if (i == 0) {
          if ($scope.exercise.sentences[i].order == 0) {
            score += 1;
          }
        } else if ($scope.exercise.sentences[i].order === $scope.exercise.sentences[i - 1].order + 1) {
          score += 1;
        }
      }
      if (score == $scope.exercise.sentences.length) {
        console.log('it is');
        $('#myModal').modal();
      }
      $scope.score.unshift(score);
    };
  }
]);
'use strict';
/*global app:true*/
app.controller('IndexCtrl', [
  '$scope',
  'ExerciseBackend',
  function ($scope, ExerciseBackend) {
  }
]);
'use strict';
/*global app:true*/
/*global $:false */
app.controller('AnnotationController', [
  '$scope',
  '$timeout',
  function ($scope, $timeout) {
    $scope.annotationColours = [
      {
        name: 'Red',
        value: 'red'
      },
      {
        name: 'Green',
        value: 'green'
      },
      {
        name: 'Blue',
        value: 'blue'
      },
      {
        name: 'Yellow',
        value: 'yellow'
      },
      {
        name: 'Pink',
        value: 'pink'
      },
      {
        name: 'Aqua',
        value: 'aqua'
      }
    ];
    $scope.templates = [
      {
        type: 'red',
        comment: 'Grammar mistake',
        points: -1
      },
      {
        type: 'aqua',
        comment: 'Spelling mistake',
        points: -1
      }
    ];
    $scope.useTemplate = function (template) {
      if (template.type !== null) {
        $scope.$annotation.type = template.type;
      }
      if (template.comment !== null) {
        $scope.$annotation.data.comment = template.comment;
      }
      if (template.points !== null) {
        $scope.$annotation.data.points = template.points;
      }
      $scope.$close();
    };
    $scope.useColor = function (color) {
      if (color.value !== null) {
        $scope.$annotation.type = color.value;
      }
    };
    $scope.isActiveColor = function (color) {
      return color && color.value === $scope.$annotation.type;
    };
    $scope.close = function () {
      return $scope.$close();
    };
    $scope.reject = function () {
      return $scope.$reject();
    };
  }
]).controller('PdfController', [
  '$scope',
  '$timeout',
  'NGAnnotation',
  function ($scope, $timeout, NGAnnotation) {
    $scope.demoTexts = ['The Stockholm School of Economics (SSE) or Handelsh\xf6gskolan i Stockholm (HHS) is one of the leading European business schools. SSE is a private business school that receives most of its financing from private sources. SSE offers bachelors, masters and MBA programs, along with highly regarded PhD programs and extensive Executive Education (customized and open programs).\r\rSSE\'s Masters in Management program is ranked no. 18 worldwide by the Financial Times.[1] QS ranks SSE no.26 among universities in the field of economics worldwide\r\rSSE is accredited by EQUIS certifying that all of its main activities, teaching as well as research, are of the highest international standards. SSE is also the Swedish member institution of CEMS together with universities such as London School of Economics, Copenhagen Business School, Tsinghua University, Bocconi University, HEC Paris and the University of St. Gallen.\r\rSSE has founded sister organizations: SSE Riga in Riga, Latvia, and SSE Russia in St Petersburg, Russia. It also operates a research institute in Tokyo, Japan; the EIJS (European Institute of Japanese Studies).'];
    $scope.annotations = [[
        new NGAnnotation({
          startIndex: 0,
          endIndex: 39,
          type: 'green',
          data: {
            comment: 'Well written!',
            points: 2
          }
        }),
        new NGAnnotation({
          startIndex: 45,
          endIndex: 60,
          type: 'pink',
          data: {
            comment: 'Poorly written!',
            points: -2
          }
        })
      ]];
    $scope.onAnnotate = function ($annotation) {
      console && console.log($annotation);
    };
    $scope.onAnnotateError = function ($ex) {
      if ($ex.message === 'NG_ANNOTATE_TEXT_PARTIAL_NODE_SELECTED') {
        return alert('Invalid selection.');
      } else {
        throw $ex;
      }
    };
    $scope.onPopupShow = function ($el) {
      var firstInput;
      firstInput = $el.find('input, textarea').eq(0).focus();
      return firstInput && firstInput[0].select();
    };
    $scope.hasPoints = function (points) {
      var _isNaN;
      _isNaN = Number.isNaN || isNaN;
      return typeof points === 'number' && points !== 0 && !_isNaN(points);
    };
    $scope.hasComment = function (comment) {
      return typeof comment === 'string' && comment.length > 0;
    };
    $scope.annotationsAsFlatList = function (annotations) {
      if (annotations == null) {
        annotations = $scope.annotations[0];
      }
      if (!annotations.length) {
        return [];
      } else {
        return annotations.map(function (annotation) {
          var arr;
          arr = [];
          if ($scope.hasComment(annotation.data.comment)) {
            arr.push(annotation);
          }
          if (annotation.children && annotation.children.length) {
            arr = arr.concat($scope.annotationsAsFlatList(annotation.children));
          }
          return arr;
        }).reduce(function (prev, current) {
          return prev.concat(current);
        });
      }
    };
    return $scope.clearPopups = function () {
      return $scope.$broadcast('ngAnnotateText.clearPopups');
    };
  }
]);
'use strict';
/*global app:true*/
app.controller('NavbarCtrl', [
  '$scope',
  '$rootScope',
  'UserBackend',
  '$location',
  function ($scope, $rootScope, UserBackend, $location) {
    $scope.login = function () {
      Parse.User.logIn($scope.username, $scope.password, {
        success: function (user) {
          $rootScope.sessionUser = user;
          $scope.$apply(function () {
            $location.path('/myExercises');
          });
        },
        error: function (user, error) {
          $.iGrowl({
            icon: 'iconFeather-featherCross',
            type: 'error',
            small: 'true',
            title: 'Login Error',
            message: 'The login information you entered is invalid. If you forgot your password, <a href=\'#/forgot\'>click here</a>!',
            delay: 10000,
            placement: {
              x: 'left',
              y: 'top'
            }
          });
        }
      });
    };
    $scope.logout = function () {
      UserBackend.logout();
    };
  }
]);
app.controller('MyExercisesCtrl', [
  '$scope',
  '$rootScope',
  'UserBackend',
  'ExerciseBackend',
  function ($scope, $rootScope, UserBackend, ExerciseBackend) {
    UserBackend.getExercises().then(function (result) {
      $scope.exercises = result;
      console.log($scope.exercises[0]);
    });
    $scope.delete = function (index) {
      if ($scope.exercises[index].owner == $rootScope.userSession) {
        $scope.exercises[index].destroy({
          success: function (exercise) {
            console.log('sucessfully deleted it');
            $scope.exercises.splice(index);
            $scope.$apply();
          },
          error: function (object, error) {
            console.log('error');
          }
        });
      }
    };
  }
]);
app.controller('LoginCtrl', [
  '$scope',
  '$rootScope',
  'UserBackend',
  '$location',
  function ($scope, $rootScope, UserBackend, $location) {
    $scope.user = {};
    if ($rootScope.sessionUser) {
      $location.path('/myExercises');
    }
    $scope.login = function () {
      Parse.User.logIn($scope.user.email_add, $scope.user.password, {
        success: function (user) {
          $rootScope.sessionUser = user;
          $scope.$apply(function () {
            $location.path('/myExercises');
          });
        },
        error: function (user, error) {
          $scope.loginError = true;
          $scope.$apply();
        }
      });
    };
  }
]);