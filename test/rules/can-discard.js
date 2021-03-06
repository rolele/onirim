import expect from 'expect'

import { canDiscard } from '../../app/lib/rules'

describe( 'rules', function() {

  describe( 'canDiscard', function() {
    beforeEach( function() {
      this.game = {
        limbo: [],
        prophecy: [],
        doors: [],
        hand: [ 'RM', 'RS', 'RK', 'BK', 'BS' ]
      }
    } )

    it( 'should discard a key with a nightmare in limbo', function() {
      const game = { ...this.game, limbo: [ 'NN' ] }
      expect( canDiscard( game, 'RK' ) ).toBeTruthy()
    } )
    it( 'should discard with a key/door match in limbo', function() {
      const game = { ...this.game, limbo: [ 'RD' ] }
      expect( canDiscard( game, 'RK' ) ).toBeTruthy()
    } )
    it( 'should not discard with a non-matching key/door match', function() {
      const game = { ...this.game, limbo: [ 'RD' ] }
      expect( canDiscard( game, 'BK' ) ).toBeFalsy()
    } )
    it( 'should not discard with a partial hand', function() {
      const game = { ...this.game, hand: this.game.hand.slice(0, -1) }
      expect( canDiscard( game, 'RM' ) ).toBeFalsy()
    } )
    it( 'should not discard with a card not in hand', function() {
      expect( canDiscard( this.game, 'NOPE' ) ).toBeFalsy()
    } )
    it( 'should discard with a full hand', function() {
      expect( canDiscard( this.game, 'RM' ) ).toBeTruthy()
    } )

    describe( 'active nightmare', function() {
      beforeEach( function() {
        this.game.limbo = [ 'NN' ]
        this.game.activeLimbo = 'NN'
      } )
      it( 'should allow discarding a door', function() {
        const game = { ...this.game, doors: [ 'RD' ] }
        expect( canDiscard( game, 'RD' ) ).toBeTruthy()
      } )
    } )

    describe( 'from prophecy', function() {
      beforeEach( function() {
        this.game.prophecy = [ 'NN', 'GD', 'BS', 'RK', 'YS' ]
        this.game.lastProphecySize = 5
      } )
      it( 'should discard a nightmare', function() {
        expect( canDiscard( this.game, 'NN' ) ).toBeTruthy()
      } )
      it( 'should discard regular cards', function() {
        expect( canDiscard( this.game, 'GD' ) ).toBeTruthy()
      } )
      it( 'should not discard more than one card', function() {
        this.game.prophecy.pop()
        expect( canDiscard( this.game, 'NN' ) ).toBeFalsy()
      } )
    } )
  } )

} )
